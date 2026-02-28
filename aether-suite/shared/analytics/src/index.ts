import { z } from "zod";

const eventSchema = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
  payload: z.record(z.any()).default({})
});

export type AnalyticsEvent = z.infer<typeof eventSchema>;

export function trackEvent(input: AnalyticsEvent): void {
  const event = eventSchema.parse(input);

  if (process.env.NODE_ENV !== "test") {
    console.info("[analytics]", JSON.stringify(event));
  }
}
