import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const connectionString =
  process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING;

export const appInsights: ApplicationInsights | null = (() => {
  // Only initialize in the browser and only when configured
  if (typeof window === 'undefined') return null;
  if (!connectionString || connectionString.trim().length === 0) return null;

  const ai = new ApplicationInsights({
    config: {
      connectionString,
      // optional: reduce noise in dev if you want
      // enableAutoRouteTracking: true,
    },
  });

  ai.loadAppInsights();
  return ai;
})();