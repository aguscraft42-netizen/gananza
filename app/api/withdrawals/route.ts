import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/env";
import { getAppContext } from "@/lib/gananza/server-data";
import { validateWithdrawalRequest } from "@/lib/gananza/withdrawal-rules";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount);
  const payoutMethodId = typeof body.payoutMethodId === "string" ? body.payoutMethodId : "";
  const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : crypto.randomUUID();

  if (!Number.isFinite(amount) || amount <= 0 || !payoutMethodId) {
    return NextResponse.json({ error: "Datos de retiro incompletos o inválidos." }, { status: 400 });
  }

  if (!isSupabaseEnabled) {
    return NextResponse.json({ ok: true, mode: "demo", id: `GNZ-${Date.now()}` });
  }

  const context = await getAppContext();
  if (!context.user) {
    return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
  }

  const supabase = await createClient();

  // Obtener método de retiro solicitado
  const { data: method, error: methodError } = await supabase
    .from("payout_methods")
    .select("id, method_type")
    .eq("id", payoutMethodId)
    .eq("user_id", context.user.id)
    .single();

  if (methodError || !method) {
    return NextResponse.json({ error: "Método de retiro no válido o no pertenece al usuario." }, { status: 400 });
  }

  // Validar reglas configurables en el servidor (mínimos, saldo disponible, solicitudes activas, 7 días de cooldown)
  const validation = await validateWithdrawalRequest({
    userId: context.user.id,
    amount,
    methodType: method.method_type,
    availableBalance: context.wallet.available,
  });

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Ejecutar función RPC de reserva transaccional
  const { data, error } = await supabase.rpc("request_withdrawal", {
    p_amount: amount,
    p_payout_method_id: payoutMethodId,
    p_idempotency_key: idempotencyKey,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, withdrawal: data });
}
