export { AETHER_EVENTS, AETHER_EVENT_NAMES } from "./events";
export type { AetherEventCategory, AetherEventName } from "./events";

export { trackEvent, trackPageView } from "./collector";
export type { TrackEventParams, TrackPageViewParams } from "./collector";

export { analyticsClient, useAnalytics } from "./client";
