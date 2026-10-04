import { app } from '@azure/functions';
import { DATAVERSE_WEB_API_BASE_URL } from '../lib/config.js';
import { getDataverseToken } from '../lib/dataverse.js';
import { createIntakeDataverseAdapter, reconcileIntake } from '../lib/intake.js';
import { createProductionsRelay, reconcileProductionsBp09Notice, reconcileProductionsBp09Notices } from '../lib/productionsBp09Notice.js';
import { scanProductionsBp09DispositionCandidates } from '../lib/productionsBp09Disposition.js';
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
      const mode = process.env.JM1_PRODUCTIONS_BP09_NOTICE_MODE || 'off';
      let noticeFailure = null;
      const retentionMode = process.env.JM1_PRODUCTIONS_BP09_RETENTION_MODE || 'off';
      let retentionFailure = null;
      if (retentionMode === 'prepare') {
        const candidates = await scanProductionsBp09DispositionCandidates({ adapter });
        const exceptions = candidates.filter((item) => item.state === 'FAILED');
        context.log(JSON.stringify({ event: 'PRODUCTIONS_BP09_DISPOSITION_PREPARE', scanned: candidates.length,
          pending: candidates.filter((item) => item.state.startsWith('PENDING_')).length,
          exceptions: exceptions.map(({ id, code }) => ({ id, code })) }));
        if (exceptions.length) retentionFailure = `${exceptions.length} Productions BP-09 disposition candidate(s) require reconciliation`;
      } else if (retentionMode !== 'off') {
        throw new Error('Productions BP-09 retention mode is invalid');
      }
      if (mode !== 'off') {
        if (mode === 'continuous') {
          const outcomes = await reconcileProductionsBp09Notices({
            adapter,
            relay: createProductionsRelay(),
            startAt: process.env.JM1_PRODUCTIONS_BP09_NOTICE_START_AT
          });
          const exceptions = outcomes.filter((item) => ['FAILED', 'HELD', 'OVERDUE'].includes(item.state));
          context.log(JSON.stringify({ event: 'PRODUCTIONS_BP09_NOTICE', scanned: outcomes.length,
            accepted: outcomes.filter((item) => item.state === 'PROVIDER_ACCEPTED').length,
            exceptions }));
          if (exceptions.length) noticeFailure = `${exceptions.length} Productions BP-09 notice(s) require reconciliation`;
        } else if (!['probe', 'send', 'replay'].includes(mode) || !process.env.JM1_PRODUCTIONS_BP09_NOTICE_RECEIPT_ID) {
          throw new Error('Productions BP-09 notice pilot configuration is invalid');
        } else {
          try {
            const result = await reconcileProductionsBp09Notice({
              adapter,
              relay: createProductionsRelay(),
              id: process.env.JM1_PRODUCTIONS_BP09_NOTICE_RECEIPT_ID,
              mode
            });
            context.log(JSON.stringify({ event: 'PRODUCTIONS_BP09_NOTICE', state: result.state, code: result.code || null }));
            if (result.newlyHeld) noticeFailure = `Productions BP-09 notice held: ${result.code}`;
          } catch (error) {
            noticeFailure = `Productions BP-09 notice check failed: ${error.code || 'UNCLASSIFIED'}`;
          }
        }
      }
      if (failed.length || noticeFailure || retentionFailure) throw new Error([
        ...(failed.length ? [`${failed.length} website intake receipt(s) remain pending reconciliation`] : []),
        ...(noticeFailure ? [noticeFailure] : []),
        ...(retentionFailure ? [retentionFailure] : [])
      ].join('; '));
    }
  )
});
