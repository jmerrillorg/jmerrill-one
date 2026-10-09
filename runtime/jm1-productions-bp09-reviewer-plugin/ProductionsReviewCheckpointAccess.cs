using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Script.Serialization;

namespace Jm1.Productions.Bp09
{
    internal static class CheckpointAccess
    {
        internal static readonly Guid ReviewerTeam = new Guid("36ee36cf-6ebf-f111-aaaf-6045bdd69435");
        private static readonly Guid RuntimeObjectId = new Guid("38b09d6f-34d9-48b3-9627-f04c047fd534");
        private const string Subject = "JM1 Website Intake - J Merrill Productions";
        private const string ReceiptAction = "BP09WebsiteIntakeV2";
        private const string CheckpointField = "jm1_bp09reviewcheckpoint";
        private const int MaxCheckpointLength = 3500;
        private static readonly JavaScriptSerializer Json = new JavaScriptSerializer { MaxJsonLength = 12000 };

        internal static IOrganizationService Authorize(IPluginExecutionContext context, IOrganizationServiceFactory factory)
        {
            if (context == null || factory == null || !context.IsInTransaction)
                Deny("CONTEXT_INVALID");
            var system = factory.CreateOrganizationService(null);
            var caller = system.Retrieve("systemuser", context.InitiatingUserId,
                new ColumnSet("azureactivedirectoryobjectid", "isdisabled", "accessmode"));
            if (caller.GetAttributeValue<Guid?>("azureactivedirectoryobjectid") != RuntimeObjectId ||
                caller.GetAttributeValue<bool>("isdisabled") ||
                caller.GetAttributeValue<OptionSetValue>("accessmode")?.Value != 4)
                Deny("RUNTIME_IDENTITY_DENIED");
            return system;
        }

        internal static Entity ValidateBinding(IOrganizationService service, Guid receiptId, Guid leadId)
        {
            if (receiptId == Guid.Empty || leadId == Guid.Empty) Deny("BINDING_INVALID");
            Entity lead;
            try
            {
                lead = service.Retrieve("lead", leadId, new ColumnSet("ownerid", "subject", "statecode",
                    "statuscode", "jm1_bp09intakereceiptid", "jm1_bp09receivedat", CheckpointField, "versionnumber"));
            }
            catch { Deny("LEAD_NOT_FOUND"); return null; }
            var owner = lead.GetAttributeValue<EntityReference>("ownerid");
            var storedReceipt = lead.GetAttributeValue<string>("jm1_bp09intakereceiptid");
            if (owner == null || owner.LogicalName != "team" || owner.Id != ReviewerTeam ||
                lead.GetAttributeValue<string>("subject") != Subject ||
                lead.GetAttributeValue<OptionSetValue>("statecode")?.Value != 0 ||
                !Guid.TryParse(storedReceipt, out var parsedReceipt) || parsedReceipt != receiptId)
                Deny("LEAD_DENIED");

            Entity receipt;
            try
            {
                receipt = service.Retrieve("jm1_executionlog", receiptId,
                    new ColumnSet("jm1_actiontype", "jm1_actiondescription"));
            }
            catch { Deny("RECEIPT_NOT_FOUND"); return null; }
            if (receipt.GetAttributeValue<string>("jm1_actiontype") != ReceiptAction)
                Deny("RECEIPT_DENIED");
            IntakeReceipt detail;
            try
            {
                var bytes = Encoding.UTF8.GetBytes(receipt.GetAttributeValue<string>("jm1_actiondescription") ?? "");
                using (var stream = new MemoryStream(bytes))
                    detail = (IntakeReceipt)new DataContractJsonSerializer(typeof(IntakeReceipt)).ReadObject(stream);
            }
            catch { Deny("RECEIPT_INVALID"); return null; }
            if (detail == null || detail.State != "COMPLETED" ||
                detail.Channel != "jmerrill.productions/contact" ||
                detail.RoutingDestination != "J Merrill Productions" ||
                detail.Consent == null || !detail.Consent.Given || detail.Consent.Purpose != "respond_to_inquiry" ||
                detail.LeadReference != leadId.ToString("D") || detail.Id != receiptId.ToString("D"))
                Deny("RECEIPT_DENIED");
            return lead;
        }

        internal static List<Dictionary<string, object>> ReadActions(IOrganizationService service, Guid receiptId, Guid leadId)
        {
            var query = new QueryExpression("jm1_productionsinquiryaction")
            {
                ColumnSet = new ColumnSet("jm1_receiptid", "jm1_leadid", "jm1_actionid", "jm1_outcome",
                    "jm1_before", "jm1_after", "jm1_actorid", "jm1_actorobjectid", "jm1_key", "createdon", "createdby"),
                TopCount = 11
            };
            query.Criteria.AddCondition("jm1_receiptid", ConditionOperator.Equal, receiptId.ToString("D"));
            query.Criteria.AddCondition("jm1_leadid", ConditionOperator.Equal, leadId.ToString("D"));
            var rows = service.RetrieveMultiple(query).Entities;
            if (rows.Count > 10) Deny("ACTION_SCAN_CAPACITY");
            var actions = new List<Dictionary<string, object>>();
            foreach (var row in rows)
            {
                var createdBy = row.GetAttributeValue<EntityReference>("createdby");
                actions.Add(new Dictionary<string, object>
                {
                    ["id"] = row.Id.ToString("D"),
                    ["receiptId"] = row.GetAttributeValue<string>("jm1_receiptid"),
                    ["leadId"] = row.GetAttributeValue<string>("jm1_leadid"),
                    ["actionId"] = row.GetAttributeValue<string>("jm1_actionid"),
                    ["outcome"] = row.GetAttributeValue<string>("jm1_outcome"),
                    ["before"] = row.GetAttributeValue<string>("jm1_before"),
                    ["after"] = row.GetAttributeValue<string>("jm1_after"),
                    ["actorUserId"] = row.GetAttributeValue<string>("jm1_actorid"),
                    ["actorObjectId"] = row.GetAttributeValue<string>("jm1_actorobjectid"),
                    ["idempotencyKey"] = row.GetAttributeValue<string>("jm1_key"),
                    ["recordedAt"] = Utc(row.GetAttributeValue<DateTime>("createdon")),
                    ["recordingActorId"] = createdBy?.Id.ToString("D")
                });
            }
            return actions;
        }

        internal static Dictionary<string, object> Candidate(Entity lead)
        {
            var received = lead.GetAttributeValue<DateTime?>("jm1_bp09receivedat");
            return new Dictionary<string, object>
            {
                ["receiptId"] = lead.GetAttributeValue<string>("jm1_bp09intakereceiptid"),
                ["leadId"] = lead.Id.ToString("D"),
                ["acceptedAt"] = received.HasValue ? Utc(received.Value) : null
            };
        }

        internal static string Utc(DateTime value)
        {
            var utc = value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(value, DateTimeKind.Utc) : value.ToUniversalTime();
            return utc.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);
        }
        internal static string JsonString(object value) => Json.Serialize(value);
        internal static Dictionary<string, object> JsonObject(string value)
        {
            if (String.IsNullOrWhiteSpace(value) || value.Length > MaxCheckpointLength) Deny("CHECKPOINT_SIZE_INVALID");
            try { return Json.Deserialize<Dictionary<string, object>>(value); }
            catch { Deny("CHECKPOINT_JSON_INVALID"); return null; }
        }

        internal static Guid RequiredGuid(IPluginExecutionContext context, string name)
        {
            if (!context.InputParameters.Contains(name) || !(context.InputParameters[name] is Guid) ||
                (Guid)context.InputParameters[name] == Guid.Empty)
                Deny("PARAMETER_INVALID");
            return (Guid)context.InputParameters[name];
        }

        internal static string RequiredString(IPluginExecutionContext context, string name, int max = 4000)
        {
            if (!context.InputParameters.Contains(name) || !(context.InputParameters[name] is string) ||
                String.IsNullOrWhiteSpace((string)context.InputParameters[name]) || ((string)context.InputParameters[name]).Length > max)
                Deny("PARAMETER_INVALID");
            return (string)context.InputParameters[name];
        }

        internal static int RequiredInt(IPluginExecutionContext context, string name, int minimum, int maximum)
        {
            if (!context.InputParameters.Contains(name) || !(context.InputParameters[name] is int) ||
                (int)context.InputParameters[name] < minimum || (int)context.InputParameters[name] > maximum)
                Deny("PARAMETER_INVALID");
            return (int)context.InputParameters[name];
        }

        internal static void Deny(string code) => throw new InvalidPluginExecutionException("PRD_CHECKPOINT_" + code);
    }

    public sealed class ListProductionsReviewCheckpointCandidates : IPlugin
    {
        public void Execute(IServiceProvider provider)
        {
            var context = (IPluginExecutionContext)provider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)provider.GetService(typeof(IOrganizationServiceFactory));
            var service = CheckpointAccess.Authorize(context, factory);
            var page = CheckpointAccess.RequiredInt(context, "PageNumber", 1, 1000);
            var query = new QueryExpression("lead")
            {
                ColumnSet = new ColumnSet("ownerid", "subject", "statecode", "jm1_bp09intakereceiptid", "jm1_bp09receivedat", "createdon"),
                PageInfo = new PagingInfo { PageNumber = page, Count = 100 }
            };
            query.Criteria.AddCondition("ownerid", ConditionOperator.Equal, CheckpointAccess.ReviewerTeam);
            query.Criteria.AddCondition("subject", ConditionOperator.Equal, "JM1 Website Intake - J Merrill Productions");
            query.Criteria.AddCondition("statecode", ConditionOperator.Equal, 0);
            query.Criteria.AddCondition("jm1_bp09intakereceiptid", ConditionOperator.NotNull);
            query.Orders.Add(new OrderExpression("createdon", OrderType.Ascending));
            var rows = service.RetrieveMultiple(query);
            context.OutputParameters["RowsJson"] = CheckpointAccess.JsonString(rows.Entities.Select(CheckpointAccess.Candidate).ToList());
            context.OutputParameters["MoreRecords"] = rows.MoreRecords;
        }
    }

    public sealed class GetProductionsReviewCheckpoint : IPlugin
    {
        public void Execute(IServiceProvider provider)
        {
            var context = (IPluginExecutionContext)provider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)provider.GetService(typeof(IOrganizationServiceFactory));
            var service = CheckpointAccess.Authorize(context, factory);
            var receiptId = CheckpointAccess.RequiredGuid(context, "ReceiptId");
            var leadId = CheckpointAccess.RequiredGuid(context, "LeadId");
            var lead = CheckpointAccess.ValidateBinding(service, receiptId, leadId);
            var actions = CheckpointAccess.ReadActions(service, receiptId, leadId);
            var candidate = CheckpointAccess.Candidate(lead);
            candidate["subject"] = lead.GetAttributeValue<string>("subject");
            candidate["ownerId"] = CheckpointAccess.ReviewerTeam.ToString("D");
            candidate["stateCode"] = lead.GetAttributeValue<OptionSetValue>("statecode")?.Value;
            candidate["statusCode"] = lead.GetAttributeValue<OptionSetValue>("statuscode")?.Value;
            candidate["checkpoint"] = lead.GetAttributeValue<string>("jm1_bp09reviewcheckpoint");
            candidate["version"] = lead.RowVersion;
            candidate["actions"] = actions;
            context.OutputParameters["EvidenceJson"] = CheckpointAccess.JsonString(candidate);
        }
    }

    public sealed class SaveProductionsReviewCheckpoint : IPlugin
    {
        private const int New = 1;
        private const int FollowUpRequired = 730000001;

        public void Execute(IServiceProvider provider)
        {
            var context = (IPluginExecutionContext)provider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)provider.GetService(typeof(IOrganizationServiceFactory));
            var service = CheckpointAccess.Authorize(context, factory);
            var receiptId = CheckpointAccess.RequiredGuid(context, "ReceiptId");
            var leadId = CheckpointAccess.RequiredGuid(context, "LeadId");
            var expectedVersion = CheckpointAccess.RequiredString(context, "ExpectedVersion", 100);
            var checkpointJson = CheckpointAccess.RequiredString(context, "CheckpointJson", 3500);
            var lead = CheckpointAccess.ValidateBinding(service, receiptId, leadId);
            if (!String.Equals(lead.RowVersion, expectedVersion, StringComparison.Ordinal))
                CheckpointAccess.Deny("CONCURRENT_MODIFICATION");

            var next = CheckpointAccess.JsonObject(checkpointJson);
            ValidateCheckpoint(next, receiptId, leadId, lead, CheckpointAccess.ReadActions(service, receiptId, leadId), service);
            var normalized = CheckpointAccess.JsonString(next);
            var update = new Entity("lead", leadId) { RowVersion = expectedVersion };
            update["jm1_bp09reviewcheckpoint"] = normalized;
            try
            {
                service.Execute(new UpdateRequest { Target = update, ConcurrencyBehavior = ConcurrencyBehavior.IfRowVersionMatches });
            }
            catch (Exception) { CheckpointAccess.Deny("CHECKPOINT_SAVE_FAILED"); }
            var saved = service.Retrieve("lead", leadId, new ColumnSet("versionnumber"));
            context.OutputParameters["RowVersion"] = saved.RowVersion;
        }

        private static void ValidateCheckpoint(Dictionary<string, object> next, Guid receiptId, Guid leadId,
            Entity lead, List<Dictionary<string, object>> actions, IOrganizationService service)
        {
            RequireKeys(next, "version", "receiptId", "leadId", "acceptedAt", "dueAt", "state", "decision", "alerts");
            var version = Integer(next, "version");
            var receipt = Text(next, "receiptId");
            var leadValue = Text(next, "leadId");
            var acceptedAt = Text(next, "acceptedAt");
            var dueAt = Text(next, "dueAt");
            var state = Text(next, "state");
            var acceptedParsed = DateTime.TryParse(acceptedAt, null, DateTimeStyles.AdjustToUniversal, out var parsedAccepted);
            var dueParsed = DateTime.TryParse(dueAt, null, DateTimeStyles.AdjustToUniversal, out var parsedDue);
            if (version != 2 || !Guid.TryParse(receipt, out var parsedReceipt) || parsedReceipt != receiptId ||
                !Guid.TryParse(leadValue, out var parsedLead) || parsedLead != leadId ||
                !acceptedParsed || !dueParsed || parsedDue < parsedAccepted ||
                !new[] { "PENDING", "OVERDUE", "RESOLVED" }.Contains(state))
                CheckpointAccess.Deny("CHECKPOINT_BINDING_INVALID");
            var receivedAt = lead.GetAttributeValue<DateTime?>("jm1_bp09receivedat");
            if (!receivedAt.HasValue || Math.Abs((parsedAccepted.ToUniversalTime() - receivedAt.Value.ToUniversalTime()).TotalSeconds) > 1)
                CheckpointAccess.Deny("CHECKPOINT_TIMESTAMP_INVALID");
            var alerts = Object(next, "alerts");
            RequireKeys(alerts, "overdue", "resolved");
            ValidateAlert(Object(alerts, "overdue"), $"bp09:productions:review:overdue:{receiptId:D}:{receiptId:D}", receiptId);
            var resolvedAlert = alerts["resolved"] as Dictionary<string, object>;
            if (state == "RESOLVED")
            {
                var decision = Object(next, "decision");
                ValidateAlert(resolvedAlert, $"bp09:productions:review:resolved:{receiptId:D}:{Text(decision, "id")}",
                    Guid.TryParse(Text(decision, "id"), out var decisionId) ? decisionId : Guid.Empty);
            }
            else if (next["decision"] != null || alerts["resolved"] != null)
                CheckpointAccess.Deny("CHECKPOINT_ALERT_BINDING_INVALID");
            if (actions.Count > 1) CheckpointAccess.Deny("ACTION_AMBIGUOUS");
            if (state == "RESOLVED")
            {
                if (actions.Count != 1 || lead.GetAttributeValue<OptionSetValue>("statuscode")?.Value != FollowUpRequired)
                    CheckpointAccess.Deny("RESOLUTION_ACTION_MISSING");
                var decision = next.ContainsKey("decision") ? next["decision"] as Dictionary<string, object> : null;
                if (decision == null || !SameDecision(decision, actions[0], receiptId, leadId) || !IsAttributableReviewerAction(service, actions[0]))
                    CheckpointAccess.Deny("RESOLUTION_ACTION_MISMATCH");
            }
            else if (actions.Count != 0 || (lead.GetAttributeValue<OptionSetValue>("statuscode")?.Value != New))
                CheckpointAccess.Deny("REVIEW_ACTION_STATE_MISMATCH");

            var existingRaw = lead.GetAttributeValue<string>("jm1_bp09reviewcheckpoint");
            if (String.IsNullOrWhiteSpace(existingRaw))
            {
                if (state != "PENDING") CheckpointAccess.Deny("CHECKPOINT_TRANSITION_INVALID");
                return;
            }
            var existing = CheckpointAccess.JsonObject(existingRaw);
            RequireKeys(existing, "version", "receiptId", "leadId", "acceptedAt", "dueAt", "state", "decision", "alerts");
            if (Text(existing, "acceptedAt") != acceptedAt || Text(existing, "dueAt") != dueAt)
                CheckpointAccess.Deny("CHECKPOINT_IMMUTABLE_FIELDS_CHANGED");
            var priorState = Text(existing, "state");
            if (priorState == "RESOLVED" && state != "RESOLVED" ||
                priorState == "OVERDUE" && state == "PENDING" ||
                priorState == "PENDING" && !(state == "PENDING" || state == "OVERDUE" || state == "RESOLVED") ||
                !(priorState == "PENDING" || priorState == "OVERDUE" || priorState == "RESOLVED"))
                CheckpointAccess.Deny("CHECKPOINT_TRANSITION_INVALID");
            var priorAlerts = Object(existing, "alerts");
            EnsureAlertProgress(Object(priorAlerts, "overdue"), Object(alerts, "overdue"));
            if (priorState == "RESOLVED" && !SameDecision(Object(existing, "decision"), Object(next, "decision"), receiptId, leadId))
                CheckpointAccess.Deny("CHECKPOINT_DECISION_DRIFT");
            if (priorState == "RESOLVED") EnsureAlertProgress(Object(priorAlerts, "resolved"), resolvedAlert);
        }

        private static void ValidateAlert(Dictionary<string, object> alert, string expectedEventId, Guid expectedTransitionId)
        {
            if (alert == null) CheckpointAccess.Deny("CHECKPOINT_ALERT_INVALID");
            RequireKeys(alert, "transitionId", "eventId", "state", "attempts", "lastAttemptAt", "nextAttemptAt",
                "relayReceiptId", "messageId", "providerAcceptedAt", "failureAt", "failureCode");
            var state = Text(alert, "state");
            var attempts = Integer(alert, "attempts");
            var transitionId = Text(alert, "transitionId");
            var messageId = Text(alert, "messageId");
            var relayReceiptId = Text(alert, "relayReceiptId");
            var failureCode = Text(alert, "failureCode");
            var nextAttemptAt = Text(alert, "nextAttemptAt");
            var lastAttemptAt = Text(alert, "lastAttemptAt");
            var providerAcceptedAt = Text(alert, "providerAcceptedAt");
            var failureAt = Text(alert, "failureAt");
            if (!Guid.TryParse(transitionId, out var parsedTransitionId) || parsedTransitionId != expectedTransitionId ||
                Text(alert, "eventId") != expectedEventId ||
                !(state == "NOT_DUE" || state == "ATTEMPTING" || state == "RECEIPT_PENDING" || state == "PROVIDER_ACCEPTED" || state == "RETRY_WAIT" || state == "HELD") ||
                attempts < 0 || attempts > 3 ||
                messageId?.Length > 200 ||
                relayReceiptId != null && !Guid.TryParse(relayReceiptId, out _) ||
                failureCode != null && !System.Text.RegularExpressions.Regex.IsMatch(failureCode, "^[A-Z0-9_:-]{1,100}$") ||
                !OptionalInstant(lastAttemptAt) || !OptionalInstant(nextAttemptAt) || !OptionalInstant(providerAcceptedAt) || !OptionalInstant(failureAt) ||
                state == "NOT_DUE" && (attempts != 0 || lastAttemptAt != null || nextAttemptAt != null || relayReceiptId != null || messageId != null || providerAcceptedAt != null || failureAt != null || failureCode != null) ||
                state == "ATTEMPTING" && (attempts == 0 || lastAttemptAt == null || nextAttemptAt != null) ||
                state == "RECEIPT_PENDING" && (relayReceiptId == null || messageId != null || nextAttemptAt != null || failureCode != null) ||
                state == "PROVIDER_ACCEPTED" && (relayReceiptId == null || messageId == null || providerAcceptedAt == null || nextAttemptAt != null || failureCode != null) ||
                state == "RETRY_WAIT" && (relayReceiptId == null || attempts == 0 || nextAttemptAt == null || failureAt == null || failureCode == null) ||
                state == "HELD" && (failureCode == null || nextAttemptAt != null))
                CheckpointAccess.Deny("CHECKPOINT_ALERT_INVALID");
        }

        private static bool OptionalInstant(string value) => value == null ||
            DateTime.TryParse(value, null, DateTimeStyles.AdjustToUniversal, out _);

        private static void EnsureAlertProgress(Dictionary<string, object> prior, Dictionary<string, object> next)
        {
            if (prior == null || next == null || Text(prior, "eventId") != Text(next, "eventId") ||
                Text(prior, "transitionId") != Text(next, "transitionId") ||
                Integer(next, "attempts") < Integer(prior, "attempts") ||
                ImmutableAfterSet(prior, next, "relayReceiptId") ||
                ImmutableAfterSet(prior, next, "messageId") ||
                ImmutableAfterSet(prior, next, "providerAcceptedAt") ||
                !AllowedAlertTransition(Text(prior, "state"), Text(next, "state")))
                CheckpointAccess.Deny("CHECKPOINT_ALERT_REGRESSION");
        }

        private static bool ImmutableAfterSet(Dictionary<string, object> prior, Dictionary<string, object> next, string key)
        {
            var previous = Text(prior, key);
            return previous != null && previous != Text(next, key);
        }

        private static bool AllowedAlertTransition(string previous, string next)
        {
            if (next == "HELD") return true;
            switch (previous)
            {
                case "NOT_DUE": return next == "NOT_DUE" || next == "ATTEMPTING";
                case "ATTEMPTING": return next == "ATTEMPTING" || next == "RECEIPT_PENDING" || next == "PROVIDER_ACCEPTED" || next == "RETRY_WAIT";
                case "RECEIPT_PENDING": return next == "RECEIPT_PENDING" || next == "PROVIDER_ACCEPTED" || next == "RETRY_WAIT";
                case "PROVIDER_ACCEPTED": return next == "PROVIDER_ACCEPTED" || next == "RETRY_WAIT";
                case "RETRY_WAIT": return next == "RETRY_WAIT" || next == "ATTEMPTING";
                case "HELD": return next == "HELD";
                default: return false;
            }
        }

        private static Dictionary<string, object> Object(Dictionary<string, object> value, string key)
        {
            return value != null && value.TryGetValue(key, out var item) ? item as Dictionary<string, object> : null;
        }

        private static void RequireKeys(Dictionary<string, object> value, params string[] names)
        {
            if (value == null || value.Count != names.Length || names.Any(name => !value.ContainsKey(name)))
                CheckpointAccess.Deny("CHECKPOINT_SCHEMA_INVALID");
        }

        private static bool SameDecision(Dictionary<string, object> decision, Dictionary<string, object> action,
            Guid receiptId, Guid leadId)
        {
            return Text(decision, "id") == Text(action, "id") &&
                Text(decision, "receiptId") == receiptId.ToString("D") && Text(decision, "leadId") == leadId.ToString("D") &&
                Text(action, "receiptId") == receiptId.ToString("D") && Text(action, "leadId") == leadId.ToString("D") &&
                Text(decision, "actionId") == "ACCEPT_FOR_FOLLOW_UP" && Text(action, "actionId") == "ACCEPT_FOR_FOLLOW_UP" &&
                Text(decision, "outcome") == "ACCEPTED" && Text(action, "outcome") == "ACCEPTED" &&
                Text(decision, "before") == "NEW" && Text(action, "before") == "NEW" &&
                Text(decision, "after") == "FOLLOW_UP_REQUIRED" && Text(action, "after") == "FOLLOW_UP_REQUIRED" &&
                Text(decision, "actorUserId") == Text(action, "actorUserId") &&
                Text(decision, "actorObjectId") == Text(action, "actorObjectId") &&
                Text(decision, "recordingActorId") == Text(action, "recordingActorId") &&
                Text(decision, "recordedAt") == Text(action, "recordedAt") &&
                Text(decision, "idempotencyKey") == Text(action, "idempotencyKey");
        }

        private static bool IsAttributableReviewerAction(IOrganizationService service, Dictionary<string, object> action)
        {
            if (!Guid.TryParse(Text(action, "actorUserId"), out var actorId) ||
                !Guid.TryParse(Text(action, "actorObjectId"), out var actorObjectId) ||
                !Guid.TryParse(Text(action, "recordingActorId"), out _)) return false;
            Entity actor;
            try { actor = service.Retrieve("systemuser", actorId, new ColumnSet("azureactivedirectoryobjectid", "isdisabled", "accessmode")); }
            catch { return false; }
            if (actor.GetAttributeValue<Guid?>("azureactivedirectoryobjectid") != actorObjectId ||
                actor.GetAttributeValue<bool>("isdisabled") || actor.GetAttributeValue<OptionSetValue>("accessmode")?.Value != 0)
                return false;
            var query = new QueryExpression("team") { ColumnSet = new ColumnSet("teamid"), TopCount = 1 };
            query.Criteria.AddCondition("teamid", ConditionOperator.Equal, CheckpointAccess.ReviewerTeam);
            var membership = query.AddLink("teammembership", "teamid", "teamid");
            membership.LinkCriteria.AddCondition("systemuserid", ConditionOperator.Equal, actorId);
            return service.RetrieveMultiple(query).Entities.Count == 1;
        }

        private static string Text(Dictionary<string, object> value, string key) =>
            value != null && value.TryGetValue(key, out var result) && result != null
                ? Convert.ToString(result, CultureInfo.InvariantCulture) : null;
        private static int Integer(Dictionary<string, object> value, string key) =>
            value != null && value.TryGetValue(key, out var result) ? Convert.ToInt32(result, CultureInfo.InvariantCulture) : -1;
    }
}
