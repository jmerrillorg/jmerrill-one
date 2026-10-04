using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Security.Cryptography;
using System.Text;

namespace Jm1.Productions.Bp09
{
    public sealed class AcceptProductionsInquiry : IPlugin
    {
        private static readonly Guid ReviewerTeam = new Guid("36ee36cf-6ebf-f111-aaaf-6045bdd69435");
        private const string Message = "jm1_AcceptProductionsInquiry";
        private const string Action = "ACCEPT_FOR_FOLLOW_UP";
        private const int New = 1;
        private const int FollowUpRequired = 730000001;

        public void Execute(IServiceProvider provider)
        {
            var context = (IPluginExecutionContext)provider.GetService(typeof(IPluginExecutionContext));
            var factory = (IOrganizationServiceFactory)provider.GetService(typeof(IOrganizationServiceFactory));
            var trace = (ITracingService)provider.GetService(typeof(ITracingService));
            if (context == null || factory == null || context.MessageName != Message || !context.IsInTransaction)
                throw new InvalidPluginExecutionException("PRD_REVIEW_CONTEXT_INVALID");

            // This service is privileged only inside the transaction; caller identity is checked below.
            var service = factory.CreateOrganizationService(null);
            var actorId = context.InitiatingUserId;
            var leadId = RequiredGuid(context, "LeadId");
            var receiptId = RequiredGuid(context, "ReceiptId");
            var key = RequiredGuid(context, "IdempotencyKey");
            var version = RequiredString(context, "ExpectedVersion");
            if (RequiredString(context, "ActionId") != Action)
                Deny(trace, "ACTION_DENIED");

            var actor = service.Retrieve("systemuser", actorId,
                new ColumnSet("azureactivedirectoryobjectid", "isdisabled", "accessmode"));
            var objectId = actor.GetAttributeValue<Guid?>("azureactivedirectoryobjectid");
            if (actor.GetAttributeValue<bool>("isdisabled") || !objectId.HasValue ||
                !IsTeamMember(service, actorId))
                Deny(trace, "ACTOR_DENIED");

            var auditId = DeterministicId(key);
            var priorAudit = TryRetrieve(service, "jm1_productionsinquiryaction", auditId,
                new ColumnSet("jm1_leadid", "jm1_receiptid", "jm1_actorid", "jm1_actionid", "jm1_key"));
            if (priorAudit != null)
            {
                if (priorAudit.GetAttributeValue<string>("jm1_leadid") != leadId.ToString("D") ||
                    priorAudit.GetAttributeValue<string>("jm1_receiptid") != receiptId.ToString("D") ||
                    priorAudit.GetAttributeValue<string>("jm1_actorid") != actorId.ToString("D") ||
                    priorAudit.GetAttributeValue<string>("jm1_actionid") != Action ||
                    priorAudit.GetAttributeValue<string>("jm1_key") != key.ToString("D"))
                    Deny(trace, "KEY_REUSED");
                var replayLead = service.Retrieve("lead", leadId,
                    new ColumnSet("ownerid", "statuscode", "statecode", "jm1_bp09intakereceiptid"));
                var replayOwner = replayLead.GetAttributeValue<EntityReference>("ownerid");
                if (replayOwner == null || replayOwner.LogicalName != "team" || replayOwner.Id != ReviewerTeam ||
                    replayLead.GetAttributeValue<OptionSetValue>("statecode")?.Value != 0 ||
                    replayLead.GetAttributeValue<OptionSetValue>("statuscode")?.Value != FollowUpRequired ||
                    replayLead.GetAttributeValue<string>("jm1_bp09intakereceiptid") != receiptId.ToString("D"))
                    Deny(trace, "REPLAY_STATE_CHANGED");
                context.OutputParameters["Outcome"] = "REPLAY";
                context.OutputParameters["AuditId"] = auditId;
                return;
            }

            var receipt = service.Retrieve("jm1_executionlog", receiptId,
                new ColumnSet("jm1_actiontype", "jm1_actiondescription"));
            if (receipt.GetAttributeValue<string>("jm1_actiontype") != "BP09WebsiteIntakeV2")
                Deny(trace, "RECEIPT_DENIED");
            IntakeReceipt detail;
            try
            {
                var bytes = Encoding.UTF8.GetBytes(receipt.GetAttributeValue<string>("jm1_actiondescription") ?? "");
                using (var stream = new MemoryStream(bytes))
                    detail = (IntakeReceipt)new DataContractJsonSerializer(typeof(IntakeReceipt)).ReadObject(stream);
            }
            catch { Deny(trace, "RECEIPT_INVALID"); return; }
            if (detail.State != "COMPLETED" ||
                detail.Channel != "jmerrill.productions/contact" ||
                detail.RoutingDestination != "J Merrill Productions" ||
                detail.Consent == null || !detail.Consent.Given ||
                detail.Consent.Purpose != "respond_to_inquiry" ||
                detail.LeadReference != leadId.ToString("D") ||
                detail.Id != receiptId.ToString("D"))
                Deny(trace, "RECEIPT_DENIED");

            var lead = service.Retrieve("lead", leadId,
                new ColumnSet("ownerid", "statuscode", "statecode", "versionnumber", "subject", "jm1_bp09intakereceiptid"));
            var owner = lead.GetAttributeValue<EntityReference>("ownerid");
            if (owner == null || owner.LogicalName != "team" || owner.Id != ReviewerTeam ||
                lead.GetAttributeValue<OptionSetValue>("statecode")?.Value != 0 ||
                lead.GetAttributeValue<OptionSetValue>("statuscode")?.Value != New ||
                lead.GetAttributeValue<string>("subject") != "JM1 Website Intake - J Merrill Productions" ||
                lead.GetAttributeValue<string>("jm1_bp09intakereceiptid") != receiptId.ToString("D"))
                Deny(trace, "LEAD_DENIED");
            if (lead.RowVersion != version)
                Deny(trace, "STALE_VERSION");

            var update = new Entity("lead", leadId) { RowVersion = version };
            update["statuscode"] = new OptionSetValue(FollowUpRequired);
            service.Execute(new UpdateRequest
            {
                Target = update,
                ConcurrencyBehavior = ConcurrencyBehavior.IfRowVersionMatches
            });

            // Create failure rolls back the Lead update because this custom API must run in a transaction.
            var audit = new Entity("jm1_productionsinquiryaction", auditId);
            audit["jm1_name"] = "PRD BP09 " + key.ToString("D");
            audit["jm1_leadid"] = leadId.ToString("D");
            audit["jm1_receiptid"] = receiptId.ToString("D");
            audit["jm1_actorid"] = actorId.ToString("D");
            audit["jm1_actorobjectid"] = objectId.Value.ToString("D");
            audit["jm1_actionid"] = Action;
            audit["jm1_key"] = key.ToString("D");
            audit["jm1_before"] = "NEW";
            audit["jm1_after"] = "FOLLOW_UP_REQUIRED";
            audit["jm1_expectedversion"] = version;
            audit["jm1_correlationid"] = context.CorrelationId.ToString("D");
            audit["jm1_outcome"] = "ACCEPTED";
            service.Create(audit);
            context.OutputParameters["Outcome"] = "ACCEPTED";
            context.OutputParameters["AuditId"] = auditId;
        }

        private static bool IsTeamMember(IOrganizationService service, Guid actorId)
        {
            var query = new QueryExpression("team") { ColumnSet = new ColumnSet("teamid"), TopCount = 1 };
            query.Criteria.AddCondition("teamid", ConditionOperator.Equal, ReviewerTeam);
            var join = query.AddLink("teammembership", "teamid", "teamid");
            join.LinkCriteria.AddCondition("systemuserid", ConditionOperator.Equal, actorId);
            return service.RetrieveMultiple(query).Entities.Count == 1;
        }

        private static Entity TryRetrieve(IOrganizationService service, string name, Guid id, ColumnSet columns)
        {
            try { return service.Retrieve(name, id, columns); }
            catch (System.ServiceModel.FaultException<OrganizationServiceFault> ex)
            {
                if (ex.Detail.ErrorCode == -2147220969) return null;
                throw;
            }
        }

        private static Guid RequiredGuid(IPluginExecutionContext context, string name)
        {
            if (!context.InputParameters.Contains(name) || !(context.InputParameters[name] is Guid value) || value == Guid.Empty)
                throw new InvalidPluginExecutionException("PRD_REVIEW_PARAMETER_INVALID");
            return value;
        }

        private static string RequiredString(IPluginExecutionContext context, string name)
        {
            if (!context.InputParameters.Contains(name) || !(context.InputParameters[name] is string value) || string.IsNullOrWhiteSpace(value))
                throw new InvalidPluginExecutionException("PRD_REVIEW_PARAMETER_INVALID");
            return value;
        }

        private static Guid DeterministicId(Guid key)
        {
            using (var hash = SHA256.Create())
            {
                var bytes = hash.ComputeHash(Encoding.UTF8.GetBytes("JM1-PRD-BP09-ACTION:" + key.ToString("D")));
                var id = new byte[16];
                Array.Copy(bytes, id, id.Length);
                return new Guid(id);
            }
        }

        private static void Deny(ITracingService trace, string code)
        {
            trace?.Trace("PRD_REVIEW_DENIED " + code);
            throw new InvalidPluginExecutionException("PRD_REVIEW_" + code);
        }
    }

    [DataContract]
    internal sealed class IntakeReceipt
    {
        [DataMember(Name = "id")] public string Id { get; set; }
        [DataMember(Name = "state")] public string State { get; set; }
        [DataMember(Name = "channel")] public string Channel { get; set; }
        [DataMember(Name = "routingDestination")] public string RoutingDestination { get; set; }
        [DataMember(Name = "leadReference")] public string LeadReference { get; set; }
        [DataMember(Name = "consent")] public ConsentRecord Consent { get; set; }
    }

    [DataContract]
    internal sealed class ConsentRecord
    {
        [DataMember(Name = "given")] public bool Given { get; set; }
        [DataMember(Name = "purpose")] public string Purpose { get; set; }
    }
}
