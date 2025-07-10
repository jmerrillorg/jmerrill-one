if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
  throw new Error("Missing required Azure AD environment variables.");
}