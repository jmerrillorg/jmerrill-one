import { app } from '@azure/functions';
import { DATAVERSE_WEB_API_BASE_URL } from '../lib/config.js';
import { getDataverseToken } from '../lib/dataverse.js';
import { createIntakeDataverseAdapter, reconcileIntake } from '../lib/intake.js';
import { withDistributedTimerLease } from '../lib/runtimeLease.js';
import { runEnvelope } from '../lib/runtime.js';

app.timer('websiteIntakeReconciliationTimer', {
  schedule: process.env.JM1_INTAKE_RECONCILIATION_CRON || '0 */5 * * * *',
  handler: async (timer, context) => withDistributedTimerLease(
    'website-intake-reconciliation',
    runEnvelope('WEBSITE_INTAKE_RECONCILIATION', timer, context),
    context,
    async () => {
      const adapter = createIntakeDataverseAdapter({
        apiBase: DATAVERSE_WEB_API_BASE_URL,
        getToken: getDataverseToken
      });
      const outcomes = await reconcileIntake(adapter);
      const failed = outcomes.filter((item) => item.state === 'RETRY_PENDING');
      context.log(JSON.stringify({ event: 'WEBSITE_INTAKE_RECONCILIATION', scanned: outcomes.length, failed: failed.length }));
      if (failed.length) throw new Error(`${failed.length} website intake receipt(s) remain pending reconciliation`);
    }
  )
});
