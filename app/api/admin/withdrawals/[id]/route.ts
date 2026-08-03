import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";

  if (!action) {
    return NextResponse.json({ error: "Falta especificar la acción a realizar" }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note.trim() : "";
  const providerReference = typeof body.providerReference === "string" ? body.providerReference.trim() : "";
  const receiptName = typeof body.receiptName === "string" ? body.receiptName.trim() : "";

  // Validación: Motivo obligatorio para rechazo
  if (action === "reject" && !note) {
    return NextResponse.json({ error: "El motivo de rechazo es obligatorio para el registro de auditoría." }, { status: 400 });
  }

  // Validación: Referencia de transferencia obligatoria para marcar como pagado
  if (action === "paid" && !providerReference) {
    return NextResponse.json({ error: "La referencia de la transferencia u operación es obligatoria para marcar como pagado." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("review_withdrawal", {
    p_withdrawal_id: id,
    p_action: action,
    p_note: note || null,
    p_provider_reference: providerReference || null,
    p_receipt_url: null,
    p_receipt_name: receiptName || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, withdrawal: data });
}
