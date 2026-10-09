using Microsoft.Xrm.Sdk;
using System;

namespace Jm1.Jsj.InquiryReview
{
    public sealed class GuardJSJReviewFields : IPlugin
    {
        private static readonly string[] Protected = {
            "jm1_disposition", "jm1_dispositiondecidedby", "jm1_dispositiondecisionat",
            "jm1_dispositionsource", "jm1_dispositionrecordedby", "jm1_dispositionrecordedat",
            "jm1_closedat", "jm1_reviewnextaction", "jm1_reviewdueat",
            "jm1_reviewexternalreference", "jm1_reviewhistory"
        };

        public void Execute(IServiceProvider provider)
        {
            var context = (IPluginExecutionContext)provider.GetService(typeof(IPluginExecutionContext));
            if (context == null || context.MessageName != "Update" ||
                !context.InputParameters.Contains("Target") ||
                !(context.InputParameters["Target"] is Entity target) ||
                target.LogicalName != "jm1_jsjinquiry")
                throw new InvalidPluginExecutionException("JSJ_REVIEW_GUARD_CONTEXT_INVALID");
            foreach (var field in Protected)
            {
                if (!target.Contains(field)) continue;
                var parent = context.ParentContext;
                while (parent != null && parent.MessageName != "jm1_ReviewJSJInquiry")
                    parent = parent.ParentContext;
                if (parent == null || parent.InitiatingUserId != context.InitiatingUserId)
                    throw new InvalidPluginExecutionException("JSJ_REVIEW_DIRECT_WRITE_DENIED");
                return;
            }
        }
    }
}
