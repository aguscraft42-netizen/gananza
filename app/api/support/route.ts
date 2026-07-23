import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!isSupabaseEnabled) return NextResponse.json({ ok: true, mode: "demo", id: `DEMO-${Date.now()}` });
  const subject = typeof body.subject === "string" ? body.subject : "";
  const category = typeof body.category === "string" ? body.category : "general";
  const message = typeof body.message === "string" ? body.message : "";
  const { data, error } = await (await createClient()).rpc("create_support_ticket", {
    p_subject: subject,
    p_category: category,
    p_body: message,
    p_task_session_id: body.taskSessionId || null,
    p_withdrawal_id: body.withdrawalId || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, ticket: data });
}
