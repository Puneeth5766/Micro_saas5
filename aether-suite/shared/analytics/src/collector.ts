import { PRODUCTS } from "@aether/config";
import { AnalyticsEvent, connectDB } from "@aether/db";
import { z } from "zod";
import { AETHER_EVENT_NAMES } from "./events";

const PRODUCT_IDS = PRODUCTS.map((product) => product.id) as [string, ...string[]];

const analyticsTrackSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  sessionId: z.string().trim().min(1),
  productId: z.enum(PRODUCT_IDS),
  event: z.string().trim().min(1),
  category: z.enum(["navigation", "ai", "billing", "auth", "feature", "error"]),
  properties: z.record(z.unknown()).optional(),
  page: z.string().trim().min(1),
  userAgent: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
});

export type TrackEventParams = z.infer<typeof analyticsTrackSchema>;

export interface TrackPageViewParams {
  userId?: string;
  sessionId: string;
  productId: (typeof PRODUCT_IDS)[number];
  page: string;
  userAgent?: string;
  country?: string;
  properties?: Record<string, unknown>;
}

export function trackEvent(params: TrackEventParams): Promise<void> {
  void (async () => {
    try {
      const parsed = analyticsTrackSchema.parse(params);

      if (!AETHER_EVENT_NAMES.has(parsed.event)) {
        console.warn(`[analytics] Unknown event: ${parsed.event}`);
      }

      await connectDB();

      await AnalyticsEvent.create({
        userId: parsed.userId,
        sessionId: parsed.sessionId,
        productId: parsed.productId,
        event: parsed.event,
        category: parsed.category,
        properties: parsed.properties ?? {},
        page: parsed.page,
        userAgent: parsed.userAgent ?? "",
        country: parsed.country,
      });
    } catch (error: unknown) {
      console.warn("[analytics] Failed to track event", error);
    }
  })();

  return Promise.resolve();
}

export function trackPageView(params: TrackPageViewParams): Promise<void> {
  void trackEvent({
    userId: params.userId,
    sessionId: params.sessionId,
    productId: params.productId,
    event: "page_view",
    category: "navigation",
    properties: params.properties,
    page: params.page,
    userAgent: params.userAgent,
    country: params.country,
  });

  return Promise.resolve();
}
