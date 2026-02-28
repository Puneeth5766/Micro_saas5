export const AETHER_EVENTS = {
  auth: ["user_signed_up", "user_signed_in", "user_signed_out"],
  ai: [
    "ai_generate_started",
    "ai_generate_completed",
    "ai_generate_failed",
    "ai_stream_started",
    "ai_stream_completed",
  ],
  billing: [
    "checkout_started",
    "checkout_completed",
    "portal_opened",
    "credits_purchased",
    "subscription_upgraded",
    "subscription_cancelled",
  ],
  feature: [
    "rfp_uploaded",
    "rfp_generated",
    "rfp_exported",
    "compliance_scan_started",
    "compliance_report_exported",
    "market_analysis_started",
    "market_report_exported",
    "proposal_scored",
    "proposal_rewritten",
    "proposal_exported",
    "landing_audit_started",
    "landing_report_exported",
  ],
  navigation: ["page_view", "dashboard_opened", "settings_opened"],
  error: ["api_error", "ai_error", "billing_error"],
} as const;

export type AetherEventCategory = keyof typeof AETHER_EVENTS;

export type AetherEventName = (typeof AETHER_EVENTS)[AetherEventCategory][number];

export const AETHER_EVENT_NAMES: ReadonlySet<string> = new Set(
  Object.values(AETHER_EVENTS).flatMap((events) => [...events]),
);
