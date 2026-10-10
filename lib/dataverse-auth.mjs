export function createDataverseTokenProvider({
  mode = 'client_credentials', resource, tenantId, clientId, clientSecret,
  fetchImpl = fetch, managedCredentialFactory
}) {
  let cached = null;
  let credential = null;
  return async function getToken() {
    if (cached && cached.expiresAt > Date.now() + 120000) return cached.token;
    let token;
    let expiresAt;
    if (mode === 'system_assigned_managed_identity') {
      if (!resource || !managedCredentialFactory) throw new Error('System-assigned managed identity is not configured');
      credential ||= managedCredentialFactory();
      const result = await credential.getToken(`${resource}/.default`);
      token = result?.token;
      expiresAt = result?.expiresOnTimestamp;
    } else if (mode === 'client_credentials') {
      if (!resource || !tenantId || !clientId || !clientSecret) throw new Error('Client-credential Dataverse auth is not configured');
      const response = await fetchImpl(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId,
          client_secret: clientSecret, scope: `${resource}/.default` })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(`Dataverse auth failed: ${response.status}`);
      token = payload.access_token;
      expiresAt = Date.now() + Number(payload.expires_in || 3600) * 1000;
    } else {
      throw new Error(`Unsupported Dataverse auth mode: ${mode}`);
    }
    if (!token || !Number.isFinite(expiresAt)) throw new Error('Dataverse auth returned an invalid token response');
    cached = { token, expiresAt };
    return token;
  };
}
