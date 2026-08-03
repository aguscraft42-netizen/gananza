import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getAppContext } from "@/lib/gananza/server-data";
import { getAdminUsersList } from "@/lib/gananza/user-management";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { q = "", status = "all" } = await searchParams;
  const context = await getAppContext();

  const isStaff = !context.configured || context.roles.some((role) => ["support", "reviewer", "admin"].includes(role));
  if (!isStaff) redirect("/dashboard");

  const statusFilter = status === "active" ? "active" : status === "suspended" ? "suspended" : "all";
  const users = await getAdminUsersList({ query: q, status: statusFilter });

  return (
    <AppShell active="/admin">
      <section className="page-content">
        <div className="v3-page-heading">
          <div>
            <span className="eyebrow">ADMINISTRACIÓN DE USUARIOS</span>
            <h1>Cuentas y perfiles</h1>
            <p>Búsqueda, auditoría, saldos, actividad y control de suspensión de usuarios de Gananza.</p>
          </div>
          <span className="demo-chip">{context.configured ? "MODO REAL · RLS" : "DEMO · MOCK USERS"}</span>
        </div>

        {/* Filtros y Búsqueda */}
        <form style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }} method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, correo o UUID..."
            style={{
              flex: "1 min(320px, 100%)",
              minHeight: "42px",
              padding: "0 14px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--line)",
              color: "white",
              fontSize: "13px",
            }}
          />
          <select
            name="status"
            defaultValue={statusFilter}
            style={{
              minHeight: "42px",
              padding: "0 14px",
              borderRadius: "12px",
              background: "#0c0e14",
              border: "1px solid var(--line)",
              color: "white",
              fontSize: "13px",
            }}
          >
            <option value="all">Todas las cuentas</option>
            <option value="active">Cuentas activas</option>
            <option value="suspended">Cuentas suspendidas</option>
          </select>
          <button type="submit" className="primary-button" style={{ minHeight: "42px", padding: "0 20px" }}>
            Filtrar
          </button>
        </form>

        {/* Tabla de Usuarios */}
        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">REGISTROS</span>
              <h2>Listado de usuarios ({users.length})</h2>
            </div>
          </div>

          <div className="admin-table" style={{ overflowX: "auto" }}>
            <div
              className="admin-row head"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 0.8fr 1.2fr 0.6fr 0.6fr 0.8fr",
                gap: "10px",
                padding: "12px 10px",
                fontSize: "11px",
              }}
            >
              <span>Usuario / Email</span>
              <span>UUID</span>
              <span>Registro</span>
              <span>Disponible / Pendiente / Retenido</span>
              <span>Conv.</span>
              <span>Retiros</span>
              <span>Estado / Acción</span>
            </div>

            {users.map((u) => {
              const isSuspended = Boolean(u.suspendedAt);
              const formattedDate = new Intl.DateTimeFormat("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(u.createdAt));

              return (
                <div
                  className="admin-row"
                  key={u.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 0.8fr 1.2fr 0.6fr 0.6fr 0.8fr",
                    gap: "10px",
                    alignItems: "center",
                    padding: "12px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", color: "#f8fafc" }}>{u.displayName}</strong>
                    <small style={{ color: "#94a3b8", fontSize: "11px" }}>{u.email}</small>
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                    {u.id.slice(0, 13)}…
                  </span>
                  <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{formattedDate}</span>
                  <div>
                    <strong style={{ color: "#4ade80", fontSize: "12px", display: "block" }}>
                      ${u.availableBalance.toLocaleString("es-AR")}
                    </strong>
                    <small style={{ color: "#94a3b8", fontSize: "11px" }}>
                      P: ${u.pendingBalance.toLocaleString("es-AR")} · R: ${u.heldBalance.toLocaleString("es-AR")}
                    </small>
                  </div>
                  <span>{u.conversionsCount}</span>
                  <span>{u.withdrawalsCount}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: isSuspended ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                        color: isSuspended ? "#fca5a5" : "#86efac",
                      }}
                    >
                      {isSuspended ? "Suspendida" : "Activa"}
                    </span>
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      className="primary-button"
                      style={{ padding: "4px 10px", fontSize: "11px", minHeight: "28px" }}
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              );
            })}

            {!users.length && (
              <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                No se encontraron usuarios con los criterios de búsqueda especificados.
              </div>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
