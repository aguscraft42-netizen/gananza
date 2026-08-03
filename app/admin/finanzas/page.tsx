import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getAppContext } from "@/lib/gananza/server-data";
import { getAdminFinancials } from "@/lib/gananza/admin-finances";

export default async function AdminFinancesPage() {
  const context = await getAppContext();

  const isStaff = !context.configured || context.roles.some((role) => ["support", "reviewer", "admin"].includes(role));
  if (!isStaff) redirect("/dashboard");

  const data = await getAdminFinancials();
  const { summary, providerBreakdown, timeframes, dailyTrends, withdrawalsSummary } = data;

  const formattedFxDate = summary.fxEffectiveAt
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(summary.fxEffectiveAt))
    : "Sin registro";

  const wSummary = withdrawalsSummary[0] || {
    paidAmount: 0,
    paidCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    rejectedAmount: 0,
    rejectedCount: 0,
  };

  return (
    <AppShell active="/admin">
      <section className="page-content">
        <div className="v3-page-heading">
          <div>
            <span className="eyebrow">CONTABILIDAD Y SALDOS</span>
            <h1>Resumen financiero de Gananza</h1>
            <p>Monitoreo de obligaciones con usuarios, ingresos brutos de proveedores, pasivos retenidos y márgenes.</p>
          </div>
          <span className="demo-chip">{context.configured ? "MODO REAL · RLS" : "DEMO · MOCK FINANCES"}</span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
          <Link href="/admin" style={{ color: "var(--green)", fontSize: "13px", fontWeight: 700 }}>
            ← Volver al panel administrativo principal
          </Link>
        </div>

        {/* Banner de Tipo de Cambio Vigente */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(0, 200, 111, 0.08), rgba(0, 200, 111, 0.02))",
            border: "1px solid rgba(0, 200, 111, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 800, textTransform: "uppercase" }}>
              TIPO DE CAMBIO VIGENTE ARS/USD
            </span>
            <strong style={{ display: "block", fontSize: "20px", color: "#f8fafc", marginTop: "2px" }}>
              1 USD = ${summary.fxRateArsUsd.toLocaleString("es-AR")} ARS
            </strong>
            <small style={{ color: "#94a3b8", fontSize: "12px" }}>
              Última actualización de cotización: {formattedFxDate} hs
            </small>
          </div>
          <Link href="/admin" className="secondary-button" style={{ fontSize: "12px" }}>
            Gestionar cotización en /admin
          </Link>
        </div>

        {/* OBLIGACIÓN ACTUAL Y SALDOS DE USUARIOS */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px", color: "#f8fafc" }}>
            1. Obligación Actual y Saldos de Usuarios
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {/* Obligación Total Actual */}
            <div
              style={{
                padding: "20px",
                borderRadius: "18px",
                background: "radial-gradient(circle at 90% 10%, rgba(239, 68, 68, 0.15), transparent 40%), linear-gradient(150deg, rgba(19,40,62,0.92), rgba(9,26,43,0.9))",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <small style={{ color: "#fca5a5", fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                OBLIGACIÓN TOTAL ACTUAL DE GANANZA
              </small>
              <strong style={{ fontSize: "30px", color: "#ffffff", display: "block", margin: "8px 0 4px 0" }}>
                ${summary.totalCurrentObligation.toLocaleString("es-AR")} ARS
              </strong>
              <p style={{ margin: 0, color: "#cbd5e1", fontSize: "12px" }}>
                Fórmula: Disponible (${summary.totalAvailableBalance.toLocaleString("es-AR")}) + Pendiente (${summary.totalPendingBalance.toLocaleString("es-AR")}) + Retenido (${summary.totalHeldBalance.toLocaleString("es-AR")})
              </p>
            </div>

            {/* Saldo Disponible */}
            <div className="section-card" style={{ padding: "18px" }}>
              <small style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>SALDO DISPONIBLE TOTAL</small>
              <strong style={{ fontSize: "24px", color: "#4ade80", display: "block", marginTop: "6px" }}>
                ${summary.totalAvailableBalance.toLocaleString("es-AR")} ARS
              </strong>
              <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "4px" }}>
                Confirmado y listo para retirar
              </small>
            </div>

            {/* Saldo Pendiente */}
            <div className="section-card" style={{ padding: "18px" }}>
              <small style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>SALDO PENDIENTE DE VALIDACIÓN</small>
              <strong style={{ fontSize: "24px", color: "#facc15", display: "block", marginTop: "6px" }}>
                ${summary.totalPendingBalance.toLocaleString("es-AR")} ARS
              </strong>
              <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "4px" }}>
                Esperando confirmación de proveedor
              </small>
            </div>

            {/* Saldo Retenido */}
            <div className="section-card" style={{ padding: "18px" }}>
              <small style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>SALDO RETENIDO EN COLA</small>
              <strong style={{ fontSize: "24px", color: "#60a5fa", display: "block", marginTop: "6px" }}>
                ${summary.totalHeldBalance.toLocaleString("es-AR")} ARS
              </strong>
              <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "4px" }}>
                En proceso de revisión de retiro
              </small>
            </div>

            {/* Total Histórico Retirado */}
            <div className="section-card" style={{ padding: "18px" }}>
              <small style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>TOTAL HISTÓRICO RETIRADO</small>
              <strong style={{ fontSize: "24px", color: "#c084fc", display: "block", marginTop: "6px" }}>
                ${summary.totalWithdrawnHistorical.toLocaleString("es-AR")} ARS
              </strong>
              <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "4px" }}>
                Fondos ya pagados a usuarios
              </small>
            </div>
          </div>
        </div>

        {/* INGRESOS, RECOMPENSAS Y MARGEN */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px", color: "#f8fafc" }}>
            2. Rendimiento Bruto, Recompensas y Margen Estimado
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <div className="section-card" style={{ padding: "18px" }}>
              <small style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>INGRESOS BRUTOS REGISTRADOS</small>
              <strong style={{ fontSize: "24px", color: "#38bdf8", display: "block", marginTop: "6px" }}>
                ${summary.grossProviderRevenue.toLocaleString("es-AR")} ARS
              </strong>
              <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "4px" }}>
                Total devengado por proveedores
              </small>
            </div>

            <div className="section-card" style={{ padding: "18px" }}>
              <small style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>RECOMPENSAS ACREDITADAS</small>
              <strong style={{ fontSize: "24px", color: "#4ade80", display: "block", marginTop: "6px" }}>
                ${summary.userRewardsCredited.toLocaleString("es-AR")} ARS
              </strong>
              <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "4px" }}>
                Monto entregado a usuarios
              </small>
            </div>

            <div className="section-card" style={{ padding: "18px" }}>
              <small style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 700 }}>MARGEN ESTIMADO</small>
              {summary.estimatedMarginAmount !== null ? (
                <div>
                  <strong style={{ fontSize: "24px", color: "#a78bfa", display: "block", marginTop: "6px" }}>
                    ${summary.estimatedMarginAmount.toLocaleString("es-AR")} ARS
                  </strong>
                  <small style={{ color: "#86efac", fontSize: "11px", display: "block", marginTop: "4px" }}>
                    Margen bruto: {summary.estimatedMarginPercentage?.toFixed(1)}%
                  </small>
                </div>
              ) : (
                <div>
                  <strong style={{ fontSize: "18px", color: "#94a3b8", display: "block", marginTop: "8px" }}>
                    Datos insuficientes
                  </strong>
                  <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "4px" }}>
                    Se requiere registro de conversiones brutos
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESUMEN DE RANGOS TEMPORALES (7, 30, 90 DÍAS) */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px", color: "#f8fafc" }}>
            3. Resumen por Rangos Temporales (7, 30 y 90 días)
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {timeframes.map((tf) => (
              <div className="section-card" key={tf.days} style={{ padding: "20px" }}>
                <span className="eyebrow" style={{ color: "var(--green)", fontWeight: 700, fontSize: "11px" }}>
                  {tf.label.toUpperCase()}
                </span>
                <div style={{ marginTop: "12px", display: "grid", gap: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Conversiones:</span>
                    <strong style={{ color: "#f8fafc" }}>{tf.conversionsCount}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Ingresos brutos:</span>
                    <strong style={{ color: "#38bdf8" }}>${tf.grossRevenue.toLocaleString("es-AR")} ARS</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Recompensas:</span>
                    <strong style={{ color: "#4ade80" }}>${tf.userRewards.toLocaleString("es-AR")} ARS</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Retiros pagados:</span>
                    <strong style={{ color: "#c084fc" }}>${tf.withdrawalsPaid.toLocaleString("es-AR")} ARS</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ color: "#94a3b8" }}>Margen:</span>
                    {tf.marginAmount !== null ? (
                      <strong style={{ color: "#a78bfa" }}>${tf.marginAmount.toLocaleString("es-AR")} ARS</strong>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "12px" }}>Datos insuficientes</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TABLAS DETALLADAS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          {/* TABLA 1: Ingresos por Proveedor */}
          <section className="section-card" style={{ padding: "20px" }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">DESGLOSE POR PROVEEDOR</span>
                <h2>Ingresos y margen por proveedor</h2>
              </div>
            </div>

            <div className="admin-table" style={{ overflowX: "auto" }}>
              <div className="admin-row head" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: "10px", fontSize: "11px" }}>
                <span>Proveedor</span>
                <span>Conversiones</span>
                <span>Ingreso Bruto</span>
                <span>Recompensas Acreditadas</span>
                <span>Margen Estimado</span>
              </div>

              {providerBreakdown.map((p) => (
                <div className="admin-row" key={p.providerId} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: "10px", alignItems: "center", fontSize: "13px" }}>
                  <div>
                    <strong style={{ display: "block", color: "#f8fafc" }}>{p.providerName}</strong>
                    <small style={{ color: "#94a3b8", fontSize: "11px" }}>{p.providerSlug}</small>
                  </div>
                  <span>{p.conversionsCount}</span>
                  <strong style={{ color: "#38bdf8" }}>${p.grossRevenue.toLocaleString("es-AR")} ARS</strong>
                  <strong style={{ color: "#4ade80" }}>${p.userRewards.toLocaleString("es-AR")} ARS</strong>
                  <div>
                    {p.marginAmount !== null ? (
                      <div>
                        <strong style={{ color: "#a78bfa", display: "block" }}>${p.marginAmount.toLocaleString("es-AR")} ARS</strong>
                        <small style={{ color: "#86efac", fontSize: "11px" }}>{p.marginPercentage?.toFixed(1)}%</small>
                      </div>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "12px" }}>Datos insuficientes</span>
                    )}
                  </div>
                </div>
              ))}

              {!providerBreakdown.length && (
                <div style={{ padding: "20px", color: "#94a3b8", fontSize: "13px" }}>No hay datos de proveedores registrados.</div>
              )}
            </div>
          </section>

          {/* TABLA 2: Recompensas y Reversos */}
          <section className="section-card" style={{ padding: "20px" }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">ESTADOS CONTABLES DE CONVERSIÓN</span>
                <h2>Recompensas, pendientes y reversiones</h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>CONFIRMADAS</small>
                <strong style={{ fontSize: "20px", color: "#4ade80", marginTop: "4px", display: "block" }}>
                  {summary.confirmedConversionsCount} ({summary.confirmedConversionsAmount.toLocaleString("es-AR")} ARS)
                </strong>
              </div>

              <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)" }}>
                <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>PENDIENTES</small>
                <strong style={{ fontSize: "20px", color: "#facc15", marginTop: "4px", display: "block" }}>
                  {summary.pendingConversionsCount} ({summary.pendingConversionsAmount.toLocaleString("es-AR")} ARS)
                </strong>
              </div>

              <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>REVERTIDAS / CONTRACARGOS</small>
                <strong style={{ fontSize: "20px", color: "#fca5a5", marginTop: "4px", display: "block" }}>
                  {summary.reversedConversionsCount} ({summary.reversedConversionsAmount.toLocaleString("es-AR")} ARS)
                </strong>
              </div>
            </div>
          </section>

          {/* TABLA 3: Retiros Pagados y Pendientes */}
          <section className="section-card" style={{ padding: "20px" }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">FLUJO FINANCIERO DE EGRESOS</span>
                <h2>Retiros pagados, pendientes y rechazados</h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>PAGADOS</small>
                <strong style={{ fontSize: "20px", color: "#c084fc", marginTop: "4px", display: "block" }}>
                  {wSummary.paidCount} (${wSummary.paidAmount.toLocaleString("es-AR")} ARS)
                </strong>
              </div>

              <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>PENDIENTES / EN REVISIÓN</small>
                <strong style={{ fontSize: "20px", color: "#60a5fa", marginTop: "4px", display: "block" }}>
                  {wSummary.pendingCount} (${wSummary.pendingAmount.toLocaleString("es-AR")} ARS)
                </strong>
              </div>

              <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>RECHAZADOS / LIBERADOS</small>
                <strong style={{ fontSize: "20px", color: "#fca5a5", marginTop: "4px", display: "block" }}>
                  {wSummary.rejectedCount} (${wSummary.rejectedAmount.toLocaleString("es-AR")} ARS)
                </strong>
              </div>
            </div>
          </section>

          {/* TABLA 4: Evolución Diaria */}
          <section className="section-card" style={{ padding: "20px" }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">TENDENCIA HISTÓRICA</span>
                <h2>Evolución diaria de operaciones</h2>
              </div>
            </div>

            <div className="admin-table" style={{ overflowX: "auto" }}>
              <div className="admin-row head" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "10px", fontSize: "11px" }}>
                <span>Fecha</span>
                <span>Conversiones</span>
                <span>Ingreso Bruto</span>
                <span>Recompensas Acreditadas</span>
                <span>Retiros Pagados</span>
              </div>

              {dailyTrends.map((d) => (
                <div className="admin-row" key={d.date} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "10px", alignItems: "center", fontSize: "13px" }}>
                  <strong style={{ color: "#f8fafc" }}>{d.date}</strong>
                  <span>{d.conversionsCount}</span>
                  <strong style={{ color: "#38bdf8" }}>${d.grossRevenue.toLocaleString("es-AR")} ARS</strong>
                  <strong style={{ color: "#4ade80" }}>${d.userRewards.toLocaleString("es-AR")} ARS</strong>
                  <strong style={{ color: "#c084fc" }}>${d.withdrawalsPaid.toLocaleString("es-AR")} ARS</strong>
                </div>
              ))}

              {!dailyTrends.length && (
                <div style={{ padding: "20px", color: "#94a3b8", fontSize: "13px" }}>No hay datos suficientes de evolución diaria.</div>
              )}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
