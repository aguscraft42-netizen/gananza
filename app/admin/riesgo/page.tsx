import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getAppContext } from "@/lib/gananza/server-data";
import { getAdminRiskUsers, type RiskSignalCode } from "@/lib/gananza/admin-risk";

type PageProps = {
  searchParams: Promise<{
    riskLevel?: "all" | "high" | "medium" | "low";
    signalCode?: string;
    q?: string;
  }>;
};

const SIGNAL_LABELS: Record<string, string> = {
  rapid_conversions: "Alta frecuencia de conversiones",
  reversed_conversions: "Conversiones revertidas / descalificadas",
  early_withdrawal: "Retiro rápido post-registro",
  near_max_withdrawal: "Retiro del >90% disponible",
  multiple_rejected_withdrawals: "Múltiples retiros rechazados",
  ledger_inconsistency: "Inconsistencia de saldo / Deuda",
  activity_after_suspension: "Actividad post-suspensión",
  shared_payout_destination: "Destino de cobro compartido",
};

export default async function AdminRiskPage({ searchParams }: PageProps) {
  const { riskLevel = "all", signalCode = "all", q = "" } = await searchParams;
  const context = await getAppContext();

  const isStaff = !context.configured || context.roles.some((role) => ["support", "reviewer", "admin"].includes(role));
  if (!isStaff) redirect("/dashboard");

  const riskUsers = await getAdminRiskUsers({
    riskLevel,
    signalCode,
    query: q,
  });

  const highCount = riskUsers.filter((u) => u.riskLevel === "high").length;
  const mediumCount = riskUsers.filter((u) => u.riskLevel === "medium").length;
  const lowCount = riskUsers.filter((u) => u.riskLevel === "low").length;

  return (
    <AppShell active="/admin">
      <section className="page-content">
        <div className="v3-page-heading">
          <div>
            <span className="eyebrow">ANTIFRAUDE Y SEGURIDAD</span>
            <h1>Monitoreo de riesgo y señales de alerta</h1>
            <p>Detección de patrones anómalos, reversiones, destinos de cobro compartidos e inconsistencias.</p>
          </div>
          <span className="demo-chip">{context.configured ? "REGLAS DETERMINISTAS · RLS" : "DEMO · MOCK SIGNALS"}</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <Link href="/admin" style={{ color: "var(--green)", fontSize: "13px", fontWeight: 700 }}>
            ← Volver al panel administrativo principal
          </Link>
        </div>

        {/* Filtros y Búsqueda */}
        <form style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }} method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por usuario, email o UUID..."
            style={{
              flex: "1 min(280px, 100%)",
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
            name="riskLevel"
            defaultValue={riskLevel}
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
            <option value="all">Todos los niveles de riesgo</option>
            <option value="high">Riesgo Alto (≥70 pts)</option>
            <option value="medium">Riesgo Medio (35 - 69 pts)</option>
            <option value="low">Riesgo Bajo (&lt;35 pts)</option>
          </select>

          <select
            name="signalCode"
            defaultValue={signalCode}
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
            <option value="all">Todas las señales</option>
            {Object.entries(SIGNAL_LABELS).map(([code, label]) => (
              <option value={code} key={code}>
                {label}
              </option>
            ))}
          </select>

          <button type="submit" className="primary-button" style={{ minHeight: "42px", padding: "0 20px" }}>
            Filtrar alertas
          </button>
        </form>

        {/* Resumen de Banderas de Riesgo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--line)" }}>
            <small style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>CUENTAS CON BANDERAS</small>
            <strong style={{ fontSize: "24px", display: "block", marginTop: "4px" }}>{riskUsers.length} usuarios</strong>
          </div>
          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <small style={{ color: "#fca5a5", fontSize: "10px", display: "block" }}>RIESGO ALTO</small>
            <strong style={{ fontSize: "24px", color: "#ef4444", display: "block", marginTop: "4px" }}>{highCount}</strong>
          </div>
          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
            <small style={{ color: "#fef08a", fontSize: "10px", display: "block" }}>RIESGO MEDIO</small>
            <strong style={{ fontSize: "24px", color: "#eab308", display: "block", marginTop: "4px" }}>{mediumCount}</strong>
          </div>
          <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <small style={{ color: "#86efac", fontSize: "10px", display: "block" }}>RIESGO BAJO</small>
            <strong style={{ fontSize: "24px", color: "#22c55e", display: "block", marginTop: "4px" }}>{lowCount}</strong>
          </div>
        </div>

        {/* Listado de Usuarios y Banderas Concretas */}
        <section className="section-card" style={{ padding: "20px" }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">DETECCIÓN DETERMINISTA</span>
              <h2>Cuentas con señales de riesgo ({riskUsers.length})</h2>
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {riskUsers.map((u) => {
              const formattedSignalDate = new Intl.DateTimeFormat("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(u.lastSignalAt));

              const levelBadge =
                u.riskLevel === "high"
                  ? { label: "RIESGO ALTO", color: "#fca5a5", bg: "rgba(239, 68, 68, 0.2)" }
                  : u.riskLevel === "medium"
                  ? { label: "RIESGO MEDIO", color: "#fef08a", bg: "rgba(234, 179, 8, 0.2)" }
                  : { label: "RIESGO BAJO", color: "#86efac", bg: "rgba(34, 197, 94, 0.2)" };

              return (
                <div
                  key={u.userId}
                  style={{
                    padding: "20px",
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {/* Encabezado del Usuario */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong style={{ fontSize: "16px", color: "#f8fafc" }}>{u.displayName}</strong>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "10.5px",
                            fontWeight: 800,
                            background: levelBadge.bg,
                            color: levelBadge.color,
                          }}
                        >
                          {levelBadge.label} ({u.riskScore} pts)
                        </span>
                        {u.isSuspended && (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "999px",
                              fontSize: "10.5px",
                              fontWeight: 800,
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#fca5a5",
                            }}
                          >
                            SUSPENDIDA
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#94a3b8", display: "block", marginTop: "2px" }}>{u.email}</span>
                      <small style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>UUID: {u.userId}</small>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <small style={{ color: "#94a3b8", fontSize: "12px" }}>Última señal: {formattedSignalDate}</small>
                      <Link href={`/admin/usuarios/${u.userId}`} className="primary-button" style={{ padding: "4px 12px", fontSize: "11px", minHeight: "30px" }}>
                        Ver Ficha de Usuario
                      </Link>
                      <Link href="/admin/retiros" className="secondary-button" style={{ padding: "4px 12px", fontSize: "11px", minHeight: "30px" }}>
                        Ver Retiros
                      </Link>
                    </div>
                  </div>

                  {/* Lista de Motivos Concretos */}
                  <div style={{ display: "grid", gap: "8px", background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      MOTIVOS Y BANDERAS DE RIESGO DETECTADAS ({u.signals.length})
                    </span>

                    {u.signals.map((sig, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px" }}>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            marginTop: "5px",
                            flexShrink: 0,
                            background: sig.severity === "high" ? "#ef4444" : sig.severity === "medium" ? "#eab308" : "#22c55e",
                          }}
                        />
                        <div>
                          <strong style={{ color: "#f8fafc", display: "block" }}>{sig.title}</strong>
                          <span style={{ color: "#cbd5e1", fontSize: "12px" }}>{sig.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {!riskUsers.length && (
              <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
                No se detectaron usuarios con señales de riesgo para los filtros seleccionados.
              </div>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
