import { NextResponse } from "next/server";
import { getAppContext } from "@/lib/gananza/server-data";
import { getWithdrawalRules, updateWithdrawalRules } from "@/lib/gananza/withdrawal-rules";

export async function GET() {
  const context = await getAppContext({ requireAuth: false });
  if (context.user && !context.roles.includes("admin")) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const rules = await getWithdrawalRules();
  return NextResponse.json({ success: true, data: rules });
}

export async function POST(request: Request) {
  const context = await getAppContext();
  if (!context.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!context.roles.includes("admin")) {
    return NextResponse.json({ error: "Acceso denegado: solo administradores" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const minMercadoPago = Number.parseFloat(String(body.minMercadoPago || body.min_amount_mercado_pago));
    const minBankTransfer = Number.parseFloat(String(body.minBankTransfer || body.min_amount_bank_transfer));
    const cooldownDays = Number.parseInt(String(body.cooldownDays || body.cooldown_days_after_paid), 10);
    const maxActiveRequests = Number.parseInt(String(body.maxActiveRequests || body.max_active_requests || 1), 10);
    const reason = String(body.reason || body.motivo || "");

    const result = await updateWithdrawalRules({
      minMercadoPago,
      minBankTransfer,
      cooldownDays,
      maxActiveRequests,
      reason,
      userId: context.user.id,
      userRoles: context.roles,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar las reglas" },
      { status: 500 }
    );
  }
}
