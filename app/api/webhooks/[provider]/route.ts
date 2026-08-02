import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getProviderAdapter } from "@/lib/providers";
import { isSecretKeyConfigured } from "@/lib/server-env";
import { createAdminClient } from "@/lib/supabase/admin";

function validSignature(raw: string, signatureHeader: string, secret: string) {
  const supplied = signatureHeader.replace(/^sha256=/i, "").trim();
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied, "utf8"), Buffer.from(expected, "utf8"));
}

async function handleWebhook(request: Request, provider: string) {
  if (!isSecretKeyConfigured) {
    return NextResponse.json({ error: "Webhook server not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const secretResult = await admin.rpc("get_provider_webhook_secret", { p_provider_slug: provider });
  const config = Array.isArray(secretResult.data) ? secretResult.data[0] : secretResult.data;
  const secretKey = config?.callback_secret || process.env.CPX_RESEARCH_SECRET_KEY || "";

  const adapter = getProviderAdapter(provider);

  if (adapter) {
    const url = new URL(request.url);
    let body: Record<string, unknown> = {};

    if (request.method === "POST") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          body = await request.json();
        } catch {
          body = {};
        }
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        body = Object.fromEntries(formData.entries());
      }
    }

    const validated = await adapter.parseAndValidatePostback(request, url.searchParams, body, secretKey);

    if (!validated.isValid) {
      return NextResponse.json({ error: validated.error }, { status: validated.statusCode || 400 });
    }

    const { payload } = validated;

    if (config?.provider_id) {
      await admin.rpc("record_webhook_event", {
        p_provider_id: config.provider_id,
        p_external_event_id: payload.externalTransactionId,
        p_signature_valid: true,
        p_payload: payload.rawPayload as any,
      });
    }

    const result = await admin.rpc("apply_provider_conversion", {
      p_provider_slug: provider,
      p_external_transaction_id: payload.externalTransactionId,
      p_user_id: payload.userId,
      p_offer_id: payload.offerId || null,
      p_status: payload.status,
      p_gross_amount: payload.grossAmount,
      p_user_reward: payload.userReward,
      p_payload: payload.rawPayload as any,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return new Response("OK", { status: 200, headers: { "content-type": "text/plain" } });
  }

  // Generic fallback logic for legacy POST json webhooks
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const raw = await request.text();
  if (raw.length > 1_000_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  const eventId = request.headers.get("x-event-id") || "";
  const signature = request.headers.get("x-gananza-signature") || "";
  if (!eventId || !signature) return NextResponse.json({ error: "Missing event id or signature" }, { status: 400 });
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (secretResult.error || !config?.callback_secret) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  const signatureValid = validSignature(raw, signature, config.callback_secret);
  await admin.rpc("record_webhook_event", {
    p_provider_id: config.provider_id,
    p_external_event_id: eventId,
    p_signature_valid: signatureValid,
    p_payload: payload as any,
  });
  if (!signatureValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const required = [payload.transaction_id, payload.user_id, payload.offer_id, payload.status];
  if (required.some((value) => !value)) return NextResponse.json({ error: "Incomplete conversion payload" }, { status: 400 });
  const result = await admin.rpc("apply_provider_conversion", {
    p_provider_slug: provider,
    p_external_transaction_id: String(payload.transaction_id),
    p_user_id: String(payload.user_id),
    p_offer_id: String(payload.offer_id),
    p_status: payload.status as any,
    p_gross_amount: Number(payload.gross_amount || 0),
    p_user_reward: Number(payload.user_reward || 0),
    p_payload: payload as any,
  });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ ok: true, conversion: result.data });
}

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return handleWebhook(request, provider);
}

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return handleWebhook(request, provider);
}
