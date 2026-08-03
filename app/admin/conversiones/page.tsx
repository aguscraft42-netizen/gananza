import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getAppContext } from "@/lib/gananza/server-data";
import { getAdminConversionsList, type AdminConversionDetail } from "@/lib/gananza/admin-conversions";
import { ConversionsClient } from "./ConversionsClient";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    provider?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }>;
};

export default async function AdminConversionsPage({ searchParams }: PageProps) {
  const { q = "", provider = "all", status = "all", fromDate = "", toDate = "" } = await searchParams;
  const context = await getAppContext();

  const isStaff = !context.configured || context.roles.some((role) => ["support", "reviewer", "admin"].includes(role));
  if (!isStaff) redirect("/dashboard");

  const rawConversions = await getAdminConversionsList({
    query: q,
    provider,
    status,
    fromDate,
    toDate,
  });

  const conversions: AdminConversionDetail[] = rawConversions.map((c) => ({
    ...c,
    rawPayload: {},
    ledgerEntry: null,
  }));

  return (
    <AppShell active="/admin">
      <section className="page-content">
        <div className="v3-page-heading">
          <div>
            <span className="eyebrow">OPERACIONES DE PROVEEDOR</span>
            <h1>Conversiones e ingresos</h1>
            <p>Monitoreo, estado, montos en USD, acreditaciones locales y trazabilidad con el ledger.</p>
          </div>
          <span className="demo-chip">{context.configured ? "MODO REAL · RLS" : "DEMO · MOCK CONVERSIONS"}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <Link href="/admin" style={{ color: "var(--green)", fontSize: "13px", fontWeight: 700 }}>
            ← Volver al panel administrativo principal
          </Link>
        </div>

        {/* Formulario de Filtros y Búsqueda */}
        <form style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }} method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por usuario, UUID o ID externo de transacción..."
            style={{
              flex: "1 min(300px, 100%)",
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
            name="provider"
            defaultValue={provider}
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
            <option value="all">Todos los proveedores</option>
            <option value="cpx-research">CPX Research</option>
            <option value="theoremreach">TheoremReach</option>
          </select>

          <select
            name="status"
            defaultValue={status}
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
            <option value="all">Todos los estados</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="reversed">Revertidas</option>
            <option value="rejected">Rechazadas</option>
          </select>

          <input
            type="date"
            name="fromDate"
            defaultValue={fromDate}
            title="Desde la fecha"
            style={{
              minHeight: "42px",
              padding: "0 12px",
              borderRadius: "12px",
              background: "#0c0e14",
              border: "1px solid var(--line)",
              color: "white",
              fontSize: "13px",
            }}
          />

          <input
            type="date"
            name="toDate"
            defaultValue={toDate}
            title="Hasta la fecha"
            style={{
              minHeight: "42px",
              padding: "0 12px",
              borderRadius: "12px",
              background: "#0c0e14",
              border: "1px solid var(--line)",
              color: "white",
              fontSize: "13px",
            }}
          />

          <button type="submit" className="primary-button" style={{ minHeight: "42px", padding: "0 20px" }}>
            Filtrar conversiones
          </button>
        </form>

        {/* Rejilla de Métricas Rápidas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--line)" }}>
            <small style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>TOTAL REGISTRADAS</small>
            <strong style={{ fontSize: "22px", display: "block", marginTop: "4px" }}>{conversions.length}</strong>
          </div>
          <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <small style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>CONFIRMADAS</small>
            <strong style={{ fontSize: "22px", color: "#4ade80", display: "block", marginTop: "4px" }}>
              {conversions.filter((c) => c.status === "confirmed").length}
            </strong>
          </div>
          <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <small style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>PENDIENTES</small>
            <strong style={{ fontSize: "22px", color: "#facc15", display: "block", marginTop: "4px" }}>
              {conversions.filter((c) => c.status === "pending").length}
            </strong>
          </div>
          <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <small style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>REVERTIDAS / DUPLICADAS</small>
            <strong style={{ fontSize: "22px", color: "#fca5a5", display: "block", marginTop: "4px" }}>
              {conversions.filter((c) => c.status === "reversed" || c.isDuplicate).length}
            </strong>
          </div>
        </div>

        {/* Tabla de Conversiones */}
        <section className="section-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">TRANSACCIONES</span>
              <h2>Listado de conversiones</h2>
            </div>
          </div>

          <ConversionsClient conversions={conversions} />
        </section>
      </section>
    </AppShell>
  );
}
