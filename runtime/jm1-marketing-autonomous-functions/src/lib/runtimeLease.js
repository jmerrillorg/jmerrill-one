import { BlobServiceClient } from '@azure/storage-blob';

const containerName = process.env.JM1_RUNTIME_LEASE_CONTAINER || 'jm1-marketing-runtime-leases';
const leaseSeconds = Math.min(60, Math.max(15, Number(process.env.JM1_RUNTIME_LEASE_SECONDS || 60)));

export async function withDistributedTimerLease(worker, envelope, context, execute) {
  const connectionString = process.env.AzureWebJobsStorage;
  if (!connectionString) throw new Error('AzureWebJobsStorage is required for distributed timer leases.');

  const service = BlobServiceClient.fromConnectionString(connectionString);
  const container = service.getContainerClient(containerName);
  await container.createIfNotExists();
  const blob = container.getBlockBlobClient(`${worker}.lease`);
  if (!(await blob.exists())) {
    try {
      await blob.upload('', 0, { conditions: { ifNoneMatch: '*' } });
    } catch (error) {
      if (error.statusCode !== 409 && error.statusCode !== 412) throw error;
    }
  }

  return executeWithLeaseClient(blob.getBlobLeaseClient(), {
    worker,
    envelope,
    context,
    execute,
    durationSeconds: leaseSeconds
  });
}

export async function executeWithLeaseClient(leaseClient, { worker, envelope, context, execute, durationSeconds = 60 }) {
  let lease;
  try {
    lease = await leaseClient.acquireLease(durationSeconds);
  } catch (error) {
    if (error.statusCode === 409 || error.statusCode === 412) {
      context.log(JSON.stringify({
        ...envelope,
        worker,
        state: 'DISTRIBUTED_LEASE_HELD_BY_ANOTHER_INVOCATION',
        authoritativeExecution: false
      }));
      return { state: 'DISTRIBUTED_LEASE_HELD_BY_ANOTHER_INVOCATION' };
    }
    throw error;
  }

  let renewTimer;
  try {
    renewTimer = setInterval(() => {
      leaseClient.renewLease().catch((error) => context.error(JSON.stringify({
        ...envelope,
        worker,
        state: 'DISTRIBUTED_LEASE_RENEWAL_FAILED',
        error: safeError(error)
      })));
    }, Math.max(5000, Math.floor(durationSeconds * 500)));
    return await execute();
  } finally {
    clearInterval(renewTimer);
    await leaseClient.releaseLease().catch((error) => context.warn(JSON.stringify({
      ...envelope,
      worker,
      state: 'DISTRIBUTED_LEASE_RELEASE_FAILED_EXPIRES_SAFELY',
      error: safeError(error)
    })));
  }
}

function safeError(error) {
  return {
    name: error?.name || 'Error',
    code: error?.code || '',
    statusCode: error?.statusCode || null,
    message: error?.message || String(error)
  };
}
