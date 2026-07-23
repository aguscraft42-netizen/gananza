import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSecretKeyConfigured } from "@/lib/server-env";

function validSignature(raw: string, signatureHeader: string, secret: string) {
  const supplied = signatureHeader.replace(/^sha256=/i, "").trim();
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied, "utf8"), Buffer.from(expected, "utf8"));
}

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  if (!isSecretKeyConfigured) return NextResponse.json({ error: "Webhook server not configured" }, { status: 503 });
  const { provider } = await params;
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
  const admin = createAdminClient();
  const secretResult = await admin.rpc("get_provider_webhook_secret", { p_provider_slug: provider });
  const config = Array.isArray(secretResult.data) ? secretResult.data[0] : secretResult.data;
  if (secretResult.error || !config?.callback_secret) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  const signatureValid = validSignature(raw, signature, config.callback_secret);
  await admin.rpc("record_webhook_event", {
    p_provider_id: config.provider_id,
    p_external_event_id: eventId,
    p_signature_valid: signatureValid,
    p_payload: payload,
  });
  if (!signatureValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const required = [payload.transaction_id, payload.user_id, payload.offer_id, payload.status];
  if (required.some((value) => !value)) return NextResponse.json({ error: "Incomplete conversion payload" }, { status: 400 });
  const result = await admin.rpc("apply_provider_conversion", {
    p_provider_slug: provider,
    p_external_transaction_id: payload.transaction_id,
    p_user_id: payload.user_id,
    p_offer_id: payload.offer_id,
    p_status: payload.status,
    p_gross_amount: Number(payload.gross_amount || 0),
    p_user_reward: Number(payload.user_reward || 0),
    p_payload: payload,
  });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ ok: true, conversion: result.data });
}
