import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSecretKeyConfigured, serverEnv } from "@/lib/server-env";

export async function POST(request: Request) {
  if (!serverEnv.enableDevTools || !isSecretKeyConfigured) return NextResponse.json({ error: "Dev tools disabled" }, { status: 404 });
  const supplied = request.headers.get("x-gananza-dev-secret") || "";
  if (!serverEnv.devCallbackSecret || supplied !== serverEnv.devCallbackSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("apply_provider_conversion", {
    p_provider_slug: body.providerSlug || "gananza-demo",
    p_external_transaction_id: body.transactionId || `dev-${crypto.randomUUID()}`,
    p_user_id: body.userId,
    p_offer_id: body.offerId,
    p_status: body.status || "pending",
    p_gross_amount: Number(body.grossAmount || body.userReward || 0),
    p_user_reward: Number(body.userReward || 0),
    p_payload: { source: "dev-simulator", ...body },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, conversion: data });
}
