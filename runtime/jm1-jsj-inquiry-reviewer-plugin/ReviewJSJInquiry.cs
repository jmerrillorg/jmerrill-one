using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Security.Cryptography;
using System.Text;

namespace Jm1.Jsj.InquiryReview
{
    public sealed class ReviewJSJInquiry : IPlugin
    {
        private static readonly Guid ReviewerId = new Guid("5adf7e12-f093-f011-b4cb-6045bdeb7c0e");
        private static readonly Guid ReviewerObjectId = new Guid("9586f34b-b5f3-437b-bc64-3e44d2518427");
        private const string Message = "jm1_ReviewJSJInquiry";
        private const string Table = "jm1_jsjinquiry";
        private const int MaxHistoryLength = 20000;

        public void Execute(IServiceProvider provider)
        {
            var context = (IPluginExecutionContext)provider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)provider.GetService(typeof(IOrganizationServiceFactory));
            if (context == null || factory == null || context.MessageName != Message || !context.IsInTransaction)
                Deny("CONTEXT_INVALID");
            var service = factory.CreateOrganizationService(null);
            var actorId = context.InitiatingUserId;
            if (actorId != ReviewerId) Deny("ACTOR_DENIED");
            var actor = service.Retrieve("systemuser", actorId,
                new ColumnSet("azureactivedirectoryobjectid", "isdisabled", "accessmode", "fullname", "domainname"));
            if (actor.GetAttributeValue<Guid?>("azureactivedirectoryobjectid") != ReviewerObjectId ||
                actor.GetAttributeValue<bool>("isdisabled") ||
                actor.GetAttributeValue<OptionSetValue>("accessmode")?.Value != 0)
                Deny("ACTOR_DENIED");

            var id = GuidInput(context, "InquiryId");
            var key = GuidInput(context, "IdempotencyKey");
            var reference = TextInput(context, "Reference", 80, true);
            var action = TextInput(context, "ActionId", 40, true);
            var expected = TextInput(context, "ExpectedVersion", 30, true);
            var nextAction = TextInput(context, "NextAction", 300, false);
            var dueText = TextInput(context, "DueAt", 40, false);
            var external = TextInput(context, "ExternalReference", 300, false);
            var reason = TextInput(context, "Reason", 120, false);
            var targetState = TextInput(context, "TargetState", 40, false);
            var correctionText = TextInput(context, "CorrectionOf", 36, false);
            var correction = Guid.Empty;
            if (!String.IsNullOrEmpty(correctionText) && !Guid.TryParse(correctionText, out correction))
                Deny("CORRECTION_INVALID");
            DateTime due = default(DateTime);
            if (!String.IsNullOrEmpty(dueText) &&
                (!dueText.EndsWith("Z", StringComparison.Ordinal) ||
                 !DateTime.TryParse(dueText, CultureInfo.InvariantCulture,
                    DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out due)))
                Deny("DUE_INVALID");

            var row = service.Retrieve(Table, id, new ColumnSet(
                "jm1_name", "ownerid", "jm1_deliverystate", "jm1_disposition", "jm1_closedat",
                "jm1_reviewhistory", "jm1_reviewnextaction", "jm1_reviewdueat", "jm1_reviewexternalreference",
                "versionnumber"));
            var owner = row.GetAttributeValue<EntityReference>("ownerid");
            if (row.GetAttributeValue<string>("jm1_name") != reference ||
                owner == null || owner.LogicalName != "systemuser" || owner.Id != ReviewerId ||
                row.GetAttributeValue<string>("jm1_deliverystate") != "DELIVERED")
                Deny("INQUIRY_DENIED");

            var history = ParseHistory(row.GetAttributeValue<string>("jm1_reviewhistory"));
            var payloadHash = Hash(String.Join("\n", new[] {
                id.ToString("D"), reference, action, expected, nextAction, dueText, external,
                reason, targetState, correctionText
            }));
            foreach (var prior in history)
            {
                if (prior.Key != key.ToString("D")) continue;
                if (prior.PayloadHash != payloadHash || prior.ActorId != actorId.ToString("D"))
                    Deny("KEY_REUSED");
                context.OutputParameters["Result"] = "REPLAY";
                return;
            }

            if (row.RowVersion != expected) Deny("STALE_VERSION");
            var now = DateTime.UtcNow;
            string state;
            switch (action)
            {
                case "WAIT": state = "WAITING"; break;
                case "DEFER": state = "DEFERRED"; break;
                case "FOLLOWUP_REPORTED": state = "FOLLOWUP_REPORTED"; break;
                case "CLOSE_NO_FURTHER_ACTION": state = "CLOSED_NO_FURTHER_ACTION"; break;
                case "CORRECT": state = targetState; break;
                default: Deny("ACTION_DENIED"); return;
            }
            if (action == "CORRECT")
            {
                if (correction == Guid.Empty || history.Count == 0 ||
                    history[history.Count - 1].Key != correction.ToString("D") ||
                    String.IsNullOrWhiteSpace(reason)) Deny("CORRECTION_DENIED");
            }
            else if (correction != Guid.Empty || !String.IsNullOrEmpty(targetState)) Deny("CORRECTION_DENIED");
            if (state != "WAITING" && state != "DEFERRED" && state != "FOLLOWUP_REPORTED" &&
                state != "CLOSED_NO_FURTHER_ACTION") Deny("STATE_DENIED");
            if (state == "WAITING" || state == "DEFERRED")
            {
                if (String.IsNullOrWhiteSpace(nextAction) || due <= now || !String.IsNullOrEmpty(external))
                    Deny("NEXT_ACTION_REQUIRED");
            }
            else if (state == "FOLLOWUP_REPORTED")
            {
                if (String.IsNullOrWhiteSpace(external) || String.IsNullOrWhiteSpace(nextAction) || due <= now)
                    Deny("FOLLOWUP_REFERENCE_REQUIRED");
            }
            else if (!String.IsNullOrWhiteSpace(nextAction) || !String.IsNullOrEmpty(dueText) ||
                     String.IsNullOrWhiteSpace(reason)) Deny("CLOSURE_INVALID");
            if (action != "CORRECT" && row.GetAttributeValue<DateTime?>("jm1_closedat").HasValue)
                Deny("ALREADY_CLOSED");

            history.Add(new ReviewEntry {
                Key = key.ToString("D"), Action = action, State = state,
                PayloadHash = payloadHash, ActorId = actorId.ToString("D"),
                ActorObjectId = ReviewerObjectId.ToString("D"), At = now.ToString("o"),
                ExpectedVersion = expected, CorrectionOf = correction == Guid.Empty ? null : correction.ToString("D"),
                PriorState = row.GetAttributeValue<string>("jm1_disposition"),
                NextAction = nextAction, DueAt = dueText, ExternalReference = external, Reason = reason
            });
            var serialized = Serialize(history);
            if (serialized.Length > MaxHistoryLength) Deny("HISTORY_CAPACITY");
            var update = new Entity(Table, id) { RowVersion = expected };
            update["jm1_disposition"] = state;
            update["jm1_dispositiondecidedby"] = actor.GetAttributeValue<string>("fullname") ?? "Jackie Smith, Jr.";
            update["jm1_dispositiondecisionat"] = now;
            update["jm1_dispositionsource"] = "JM1-Core JSJ review action " + key.ToString("D");
            update["jm1_dispositionrecordedby"] = actor.GetAttributeValue<string>("domainname") ?? "Jackie Smith, Jr.";
            update["jm1_dispositionrecordedat"] = now;
            update["jm1_reviewnextaction"] = String.IsNullOrEmpty(nextAction) ? null : nextAction;
            update["jm1_reviewdueat"] = due == default(DateTime) ? (object)null : due;
            update["jm1_reviewexternalreference"] = state == "FOLLOWUP_REPORTED" ? external :
                action == "CORRECT" && reason == "WRONG_REFERENCE" ? null :
                row.GetAttributeValue<string>("jm1_reviewexternalreference");
            update["jm1_closedat"] = state == "CLOSED_NO_FURTHER_ACTION" ? (object)now : null;
            update["jm1_reviewhistory"] = serialized;
            service.Execute(new UpdateRequest {
                Target = update, ConcurrencyBehavior = ConcurrencyBehavior.IfRowVersionMatches
            });
            context.OutputParameters["Result"] = "ACCEPTED";
        }

        private static List<ReviewEntry> ParseHistory(string json)
        {
            if (String.IsNullOrEmpty(json)) return new List<ReviewEntry>();
            try
            {
                using (var stream = new MemoryStream(Encoding.UTF8.GetBytes(json)))
                    return (List<ReviewEntry>)new DataContractJsonSerializer(typeof(List<ReviewEntry>)).ReadObject(stream);
            }
            catch { Deny("HISTORY_INVALID"); return null; }
        }

        private static string Serialize(List<ReviewEntry> history)
        {
            using (var stream = new MemoryStream())
            {
                new DataContractJsonSerializer(typeof(List<ReviewEntry>)).WriteObject(stream, history);
                return Encoding.UTF8.GetString(stream.ToArray());
            }
        }

        private static string Hash(string value)
        {
            using (var hash = SHA256.Create())
                return BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(value))).Replace("-", "").ToLowerInvariant();
        }

        private static Guid GuidInput(IPluginExecutionContext context, string name)
        {
            if (!context.InputParameters.Contains(name) || !(context.InputParameters[name] is Guid value) || value == Guid.Empty)
                Deny("PARAMETER_INVALID");
            return (Guid)context.InputParameters[name];
        }

        private static string TextInput(IPluginExecutionContext context, string name, int max, bool required)
        {
            var value = context.InputParameters.Contains(name) ? context.InputParameters[name] as string : null;
            if (required && String.IsNullOrWhiteSpace(value)) Deny("PARAMETER_INVALID");
            if (value != null && (value.Length > max || value.IndexOfAny(new[] { '\r', '\n', '\0' }) >= 0))
                Deny("PARAMETER_INVALID");
            return value ?? "";
        }

        private static void Deny(string code)
        {
            throw new InvalidPluginExecutionException("JSJ_REVIEW_" + code);
        }
    }

    [DataContract]
    internal sealed class ReviewEntry
    {
        [DataMember(Name = "key")] public string Key { get; set; }
        [DataMember(Name = "action")] public string Action { get; set; }
        [DataMember(Name = "state")] public string State { get; set; }
        [DataMember(Name = "payloadHash")] public string PayloadHash { get; set; }
        [DataMember(Name = "actorId")] public string ActorId { get; set; }
        [DataMember(Name = "actorObjectId")] public string ActorObjectId { get; set; }
        [DataMember(Name = "at")] public string At { get; set; }
        [DataMember(Name = "expectedVersion")] public string ExpectedVersion { get; set; }
        [DataMember(Name = "correctionOf")] public string CorrectionOf { get; set; }
        [DataMember(Name = "priorState")] public string PriorState { get; set; }
        [DataMember(Name = "nextAction")] public string NextAction { get; set; }
        [DataMember(Name = "dueAt")] public string DueAt { get; set; }
        [DataMember(Name = "externalReference")] public string ExternalReference { get; set; }
        [DataMember(Name = "reason")] public string Reason { get; set; }
    }
}
