import { NextResponse } from "next/server";
import { getAppContext } from "@/lib/gananza/server-data";
import { updateUserStatus } from "@/lib/gananza/user-management";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getAppContext();

  const isStaff = !context.configured || context.roles.some((r) => ["admin", "reviewer"].includes(r));
  if (!isStaff) {
    return NextResponse.json({ error: "Acceso denegado. Se requieren permisos administrativos." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (action !== "suspend" && action !== "reactivate") {
    return NextResponse.json({ error: "Acción no válida. Especifique 'suspend' o 'reactivate'." }, { status: 400 });
  }

  if (action === "suspend" && !reason) {
    return NextResponse.json({ error: "El motivo de suspensión es obligatorio." }, { status: 400 });
  }

  const result = await updateUserStatus(id, action, reason, context.user?.id || "admin-user");

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Error al actualizar el usuario." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, action, userId: id });
}
