import { NextResponse } from "next/server";
import { getCurrentExchangeRate, updateExchangeRate } from "@/lib/gananza/exchange-rate";
import { getAppContext } from "@/lib/gananza/server-data";

export async function GET() {
  const context = await getAppContext({ requireAuth: false });
  if (context.user && !context.roles.includes("admin")) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const currentRate = await getCurrentExchangeRate();
  return NextResponse.json({ success: true, data: currentRate });
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
    const rate = Number.parseFloat(String(body.rate || body.fx_rate_ars_usd));
    const source = String(body.source || body.fx_source || "Manual Admin");
    const reason = String(body.reason || body.motivo || "");

    const result = await updateExchangeRate({
      rate,
      source,
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
      { error: error instanceof Error ? error.message : "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
