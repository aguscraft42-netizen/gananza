import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!isSupabaseEnabled) return NextResponse.json({ ok: true, mode: "demo", id: `GNZ-${Date.now()}` });
  const amount = Number(body.amount);
  const payoutMethodId = typeof body.payoutMethodId === "string" ? body.payoutMethodId : "";
  const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : crypto.randomUUID();
  if (!Number.isFinite(amount) || !payoutMethodId) return NextResponse.json({ error: "Datos de retiro incompletos" }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("request_withdrawal", {
    p_amount: amount,
    p_payout_method_id: payoutMethodId,
    p_idempotency_key: idempotencyKey,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, withdrawal: data });
}
