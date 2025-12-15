import { appInsights } from "@/lib/appInsights";

export function trackIntentUsage() {
  appInsights?.trackEvent({ name: "ServiceFinderUsed" });
}