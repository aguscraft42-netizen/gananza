import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";
  if (!action) return NextResponse.json({ error: "Falta action" }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("review_withdrawal", {
    p_withdrawal_id: id,
    p_action: action,
    p_note: typeof body.note === "string" ? body.note : null,
    p_provider_reference: typeof body.providerReference === "string" ? body.providerReference : null,
    p_receipt_url: typeof body.receiptUrl === "string" ? body.receiptUrl : null,
    p_receipt_name: typeof body.receiptName === "string" ? body.receiptName : null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true, withdrawal: data });
}
