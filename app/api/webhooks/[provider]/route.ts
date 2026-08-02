import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getProviderAdapter } from "@/lib/providers";
import { createAdminClient } from "@/lib/supabase/admin";

function validSignature(raw: string, signatureHeader: string, secret: string) {
  const supplied = signatureHeader.replace(/^sha256=/i, "").trim();
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied, "utf8"), Buffer.from(expected, "utf8"));
}

export async function processProviderWebhook(request: Request, providerSlug: string) {
  const admin = createAdminClient();

  // 1. Ensure provider exists and is active in public.providers database table
  let providerId: string | null = null;
  const { data: existingProvider } = await admin
    .from("providers")
    .select("id, is_active")
    .eq("slug", providerSlug)
    .maybeSingle();

  if (existingProvider) {
    providerId = existingProvider.id;
    if (!existingProvider.is_active) {
      await admin.from("providers").update({ is_active: true }).eq("id", providerId);
    }
  } else {
    // Auto-register provider if first time running in production DB
    const { data: createdProvider, error: insertError } = await admin
      .from("providers")
      .insert({
        slug: providerSlug,
        name: providerSlug === "cpx-research" ? "CPX Research" : providerSlug,
        is_active: true,
        callback_mode: providerSlug === "cpx-research" ? "cpx_md5" : "generic_hmac_sha256",
      })
      .select("id")
      .maybeSingle();

    if (!insertError && createdProvider) {
      providerId = createdProvider.id;
      const secret = process.env.CPX_APP_SECURE_HASH || process.env.CPX_RESEARCH_SECRET_KEY || "replace-me";
      await admin
        .from("provider_credentials")
        .insert({ provider_id: providerId, callback_secret: secret });
    }
  }

  // 2. Lookup provider credentials if available
  const secretResult = await admin.rpc("get_provider_webhook_secret", { p_provider_slug: providerSlug });
  const config = Array.isArray(secretResult.data) ? secretResult.data[0] : secretResult.data;
  const secretKey =
    process.env.CPX_APP_SECURE_HASH ||
    process.env.CPX_RESEARCH_SECRET_KEY ||
    config?.callback_secret ||
    "";

  const adapter = getProviderAdapter(providerSlug);

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
      console.error(
        `[Webhook ${providerSlug}] Verification failed | timestamp=${new Date().toISOString()} | error=${validated.error}`
      );
      return new Response(validated.error || "INVALID_HASH", {
        status: validated.statusCode || 401,
        headers: { "content-type": "text/plain" },
      });
    }

    const { payload } = validated;

    // 3. User verification: Ensure user exists in profiles table
    const { data: userProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", payload.userId)
      .maybeSingle();

    if (!userProfile) {
      console.error(
        `[Webhook ${providerSlug}] User not found | timestamp=${new Date().toISOString()} | trans_id=${payload.externalTransactionId} | user_id=${payload.userId}`
      );
      return new Response("User not found", { status: 400, headers: { "content-type": "text/plain" } });
    }

    // 4. Idempotency Check: Look up existing conversion
    if (providerId) {
      const { data: existingConversion } = await admin
        .from("conversions")
        .select("id, status")
        .eq("provider_id", providerId)
        .eq("external_transaction_id", payload.externalTransactionId)
        .maybeSingle();

      if (existingConversion && existingConversion.status === payload.status) {
        console.log(
          `[Webhook ${providerSlug}] Idempotent duplicate | timestamp=${new Date().toISOString()} | trans_id=${payload.externalTransactionId} | user_id=${payload.userId} | status=${payload.status} | result=ALREADY_PROCESSED`
        );
        return new Response("ALREADY_PROCESSED", { status: 200, headers: { "content-type": "text/plain" } });
      }

      await admin.rpc("record_webhook_event", {
        p_provider_id: providerId,
        p_external_event_id: payload.externalTransactionId,
        p_signature_valid: true,
        p_payload: payload.rawPayload as any,
      });
    }

    // 5. Atomic financial transaction & ledger entry
    const result = await admin.rpc("apply_provider_conversion", {
      p_provider_slug: providerSlug,
      p_external_transaction_id: payload.externalTransactionId,
      p_user_id: payload.userId,
      p_offer_id: payload.offerId || null,
      p_status: payload.status,
      p_gross_amount: payload.grossAmount,
      p_user_reward: payload.userReward,
      p_payload: payload.rawPayload as any,
    });

    if (result.error) {
      console.error(
        `[Webhook ${providerSlug}] RPC error | timestamp=${new Date().toISOString()} | trans_id=${payload.externalTransactionId} | user_id=${payload.userId} | error=${result.error.message}`
      );
      return new Response(result.error.message, { status: 400, headers: { "content-type": "text/plain" } });
    }

    console.log(
      `[Webhook ${providerSlug}] Processed successfully | timestamp=${new Date().toISOString()} | trans_id=${payload.externalTransactionId} | user_id=${payload.userId} | status=${payload.status} | type=${payload.rawPayload?.type} | result=OK`
    );

    return new Response("OK", { status: 200, headers: { "content-type": "text/plain" } });
  }

  // Fallback for generic legacy POST webhooks
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
  if (config?.provider_id) {
    await admin.rpc("record_webhook_event", {
      p_provider_id: config.provider_id,
      p_external_event_id: eventId,
      p_signature_valid: signatureValid,
      p_payload: payload as any,
    });
  }
  if (!signatureValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const required = [payload.transaction_id, payload.user_id, payload.offer_id, payload.status];
  if (required.some((value) => !value)) return NextResponse.json({ error: "Incomplete conversion payload" }, { status: 400 });
  const result = await admin.rpc("apply_provider_conversion", {
    p_provider_slug: providerSlug,
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
  return processProviderWebhook(request, provider);
}

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  return processProviderWebhook(request, provider);
}
