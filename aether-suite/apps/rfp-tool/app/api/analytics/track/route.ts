import { trackEvent } from "@aether/analytics";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";

const trackRequestSchema = z.object({
  event: z.string().trim().min(1),
  category: z.enum(["navigation", "ai", "billing", "auth", "feature", "error"]),
  properties: z.record(z.unknown()).optional(),
  page: z.string().trim().min(1),
  sessionId: z.string().trim().min(1),
});

export async function POST(request: Request): Promise<Response> {
  const userAgent = request.headers.get("user-agent") ?? "";

  let payload: z.infer<typeof trackRequestSchema> | null = null;
  try {
    const body = (await request.json()) as unknown;
    const parsed = trackRequestSchema.safeParse(body);
    if (parsed.success) {
      payload = parsed.data;
    }
  } catch {
    payload = null;
  }

  if (!payload) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  void (async () => {
    let userId: string | undefined;

    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch {
      userId = undefined;
    }

    void trackEvent({
      userId,
      sessionId: payload.sessionId,
      productId: "rfp-tool",
      event: payload.event,
      category: payload.category,
      properties: payload.properties,
      page: payload.page,
      userAgent,
    });
  })();

  return NextResponse.json({ ok: true }, { status: 200 });
}
