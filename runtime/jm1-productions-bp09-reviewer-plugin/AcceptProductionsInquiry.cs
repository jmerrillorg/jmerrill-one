using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Security.Cryptography;
using System.ServiceModel;
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
            ITracingService trace = null;
            var stage = "context";
            try
            {
                if (provider == null)
                    throw new InvalidPluginExecutionException("PRD_REVIEW_CONTEXT_INVALID");
                trace = (ITracingService)provider.GetService(typeof(ITracingService));
                var context = (IPluginExecutionContext)provider.GetService(typeof(IPluginExecutionContext));
                var factory = (IOrganizationServiceFactory)provider.GetService(typeof(IOrganizationServiceFactory));
                ExecuteCore(context, factory, trace, ref stage);
            }
            catch (InvalidPluginExecutionException ex)
            {
                if (ex.Message != null && ex.Message.StartsWith("PRD_REVIEW_", StringComparison.Ordinal))
                    throw;
                throw DiagnosticFailure(stage, ex, trace);
            }
            catch (Exception ex)
            {
                throw DiagnosticFailure(stage, ex, trace);
            }
        }

        private static void ExecuteCore(IPluginExecutionContext context, IOrganizationServiceFactory factory,
            ITracingService trace, ref string stage)
        {
            if (context == null || factory == null || context.MessageName != Message || !context.IsInTransaction)
                throw new InvalidPluginExecutionException("PRD_REVIEW_CONTEXT_INVALID");
            trace?.Trace("PRD_REVIEW_CONTEXT stage={0} message={1} transaction={2}", context.Stage,
                context.MessageName, context.IsInTransaction);

            // This service is privileged only inside the transaction; caller identity is checked below.
            stage = "actor_read";
            var service = factory.CreateOrganizationService(null);
            var actorId = context.InitiatingUserId;

            stage = "parameter_validation";
            var leadId = RequiredGuid(context, "LeadId");
            var receiptId = RequiredGuid(context, "ReceiptId");
            var key = RequiredGuid(context, "IdempotencyKey");
            var version = RequiredString(context, "ExpectedVersion");
            if (RequiredString(context, "ActionId") != Action)
                Deny(trace, "ACTION_DENIED");

            stage = "actor_lookup";
            var actor = service.Retrieve("systemuser", actorId,
                new ColumnSet("azureactivedirectoryobjectid", "isdisabled", "accessmode"));
            var objectId = actor.GetAttributeValue<Guid?>("azureactivedirectoryobjectid");
            var actorDenied = actor.GetAttributeValue<bool>("isdisabled") || !objectId.HasValue ||
                actor.GetAttributeValue<OptionSetValue>("accessmode")?.Value != 0;
            if (!actorDenied)
            {
                stage = "reviewer_team_membership";
                actorDenied = !IsTeamMember(service, actorId);
            }
            if (actorDenied)
                Deny(trace, "ACTOR_DENIED");

            stage = "idempotency_lookup";
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
                stage = "replay_lead_read";
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

            stage = "receipt_read";
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

            stage = "lead_read";
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

            stage = "lead_update";
            var update = new Entity("lead", leadId) { RowVersion = version };
            update["statuscode"] = new OptionSetValue(FollowUpRequired);
            service.Execute(new UpdateRequest
            {
                Target = update,
                ConcurrencyBehavior = ConcurrencyBehavior.IfRowVersionMatches
            });

            // Create failure rolls back the Lead update because this custom API must run in a transaction.
            stage = "action_audit_create";
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

        private static InvalidPluginExecutionException DiagnosticFailure(string stage, Exception exception,
            ITracingService trace)
        {
            var code = exception is FaultException<OrganizationServiceFault> fault && fault.Detail != null
                ? fault.Detail.ErrorCode
                : exception.HResult;
            var type = exception.GetType().Name;
            var message = "PRD_REVIEW_INTERNAL_FAILURE stage=" + stage + " type=" + type +
                " code=0x" + code.ToString("X8");
            trace?.Trace(message);
            return new InvalidPluginExecutionException(message);
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
