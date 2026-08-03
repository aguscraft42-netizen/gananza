import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminExchangeRateControl } from "@/components/AdminExchangeRateControl";
import { AdminWithdrawalActions } from "@/components/AdminWithdrawalActions";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCurrentExchangeRate } from "@/lib/gananza/exchange-rate";
import { getAdminMetrics, getAdminQueue, getAppContext, getFraudFlags } from "@/lib/gananza/server-data";

function methodLabel(type: string, fallback: string) {
  return type === "mercado_pago" ? "Mercado Pago" : fallback === "Método" ? "Transferencia a otro banco" : fallback;
}

export default async function AdminPage() {
  const [context, metrics, queue, flags, fxRateConfig] = await Promise.all([
    getAppContext(),
    getAdminMetrics(),
    getAdminQueue(),
    getFraudFlags(),
    getCurrentExchangeRate(),
  ]);

  const isStaff = context.roles.some((role) => ["support", "reviewer", "admin"].includes(role));
  const isAdmin = context.roles.includes("admin");
  const canReviewWithdrawals = context.roles.some((role) => ["reviewer", "admin"].includes(role));

  if (context.configured && !isStaff) redirect("/dashboard");
  const metric = metrics || { users: 0, pending_conversions: 0, pending_withdrawals: 0, open_tickets: 0, open_fraud_flags: 0 };

  return (
    <AppShell active="/admin">
      <section className="page-content">
        <div className="v3-page-heading">
          <div><span className="eyebrow">OPERACIONES INTERNAS</span><h1>Panel administrativo</h1><p>Usuarios, conversiones, retiros, soporte y riesgo con permisos explícitos.</p></div>
          <span className="demo-chip">{context.configured ? "ROL: " + context.roles.join(" · ").toUpperCase() : "ADMIN DEMO"}</span>
        </div>
        <div className="admin-notice"><span>!</span><p><strong>{context.configured ? "Auditoría activa." : "Entorno de demostración."}</strong> Las transiciones financieras y cambios de tipo de cambio se ejecutan mediante funciones SQL y quedan registradas.</p></div>
        
        <AdminExchangeRateControl initialConfig={fxRateConfig} realMode={context.configured} isAdmin={!context.configured || isAdmin} />

        <div className="admin-metrics">
          <article className="admin-card"><small>USUARIOS</small><strong>{Number(metric.users || 0).toLocaleString("es-AR")}</strong><span>Cuentas no suspendidas</span></article>
          <article className="admin-card"><small>CONVERSIONES PENDIENTES</small><strong>{metric.pending_conversions || 0}</strong><span>Esperando proveedor</span></article>
          <article className="admin-card"><small>RETIROS EN COLA</small><strong>{metric.pending_withdrawals || 0}</strong><span>Solicitados, revisando o aprobados</span></article>
          <article className="admin-card"><small>ALERTAS ABIERTAS</small><strong>{metric.open_fraud_flags || 0}</strong><span>{metric.open_tickets || 0} tickets de soporte</span></article>
        </div>
        <div className="admin-layout">
          <section className="section-card">
            <div className="section-head"><div><span className="eyebrow">COLA DE REVISIÓN</span><h2>Solicitudes de retiro</h2><p>Los saldos quedan retenidos antes de llegar a esta cola.</p></div></div>
            <div className="admin-table">
              <div className="admin-row head"><span>Usuario</span><span>Importe</span><span>Método</span><span>Riesgo</span><span>Espera</span><span>Acciones</span></div>
              {queue.map((row: any) => {
                const riskClass = row.risk >= 70 ? "high" : row.risk >= 35 ? "medium" : "low";
                const isMercadoPago = row.methodType === "mercado_pago";
                return (
                  <div className="admin-row" key={row.id}>
                    <strong>{row.user}</strong>
                    <span>${row.amount.toLocaleString("es-AR")}</span>
                    <span className="admin-method-cell">
                      {isMercadoPago ? <MercadoPagoLogo compact /> : <i className="bank-mini-icon"><CategoryIcon type="other-bank" size={20} /></i>}
                      <span><strong>{methodLabel(row.methodType, row.method)}</strong><small>{row.destination}</small></span>
                    </span>
                    <span><i className={`risk ${riskClass}`}>{row.risk}</i></span>
                    <span>{row.age}</span>
                    <AdminWithdrawalActions id={row.id} status={row.status} methodType={row.methodType} realMode={context.configured} canReview={!context.configured || canReviewWithdrawals} />
                  </div>
                );
              })}
              {!queue.length && <div className="empty-state compact"><h3>No hay retiros pendientes</h3><p>La cola está al día.</p></div>}
            </div>
          </section>
          <aside className="section-card">
            <div className="section-head"><div><span className="eyebrow">ANTIFRAUDE</span><h2>Alertas recientes</h2></div></div>
            <div className="fraud-list">
              {flags.map((flag: any) => <article className={`fraud-item ${flag.severity === "high" || flag.severity === "critical" ? "high" : ""}`} key={flag.id}><strong>{String(flag.reason_code).replaceAll("_", " ")}</strong><small>{flag.description}</small><span>{flag.severity}</span></article>)}
              {!flags.length && <p className="empty-copy">No hay alertas abiertas.</p>}
            </div>
            <div className="audit-summary"><strong>Auditoría inmutable</strong><p>El historial administrativo no puede editarse ni eliminarse desde la API.</p></div>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
