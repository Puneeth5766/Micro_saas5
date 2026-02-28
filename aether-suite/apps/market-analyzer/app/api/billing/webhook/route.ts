import { constructWebhookEvent, handleWebhookEvent, BillingError } from "@aether/billing";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
    }

    const rawBody = await request.text();
    const event = constructWebhookEvent(rawBody, signature);

    await handleWebhookEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: "Webhook handling failed." }, { status: 400 });
  }
}
