import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icons";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { WithdrawalWizard } from "@/components/WithdrawalWizard";
import { getAppContext, getLedgerMovements, getPayoutMethods } from "@/lib/gananza/server-data";

export default async function WithdrawalsPage() {
  const [context, movements, methods] = await Promise.all([
    getAppContext(),
    getLedgerMovements(),
    getPayoutMethods(),
  ]);
  const mercadoPagoMethod = methods.find((method: any) => method.method_type === "mercado_pago");

  return (
    <AppShell active="/retiros">
      <section className="page-content">
        <div className="v3-page-heading">
          <div>
            <span className="eyebrow">BILLETERA</span>
            <h1>Saldo y retiros</h1>
            <p>Solo el saldo confirmado queda disponible. Cada movimiento conserva su estado.</p>
          </div>
          <span className="demo-chip">{context.configured ? "LEDGER REAL · RLS" : "DEMO · SIN DINERO REAL"}</span>
        </div>

        <section className="mercado-pago-feature-banner">
          <div className="mp-feature-brand"><MercadoPagoLogo /></div>
          <div>
            <span className="eyebrow">MÉTODO PRINCIPAL EN ARGENTINA</span>
            <h2>Retirá a tu cuenta de Mercado Pago.</h2>
            <p>{mercadoPagoMethod ? `Destino guardado: ${mercadoPagoMethod.destination_masked}` : "Agregá un alias o CVU desde tu perfil. El primer retiro se revisa manualmente."}</p>
          </div>
          <span className="mp-feature-status">{mercadoPagoMethod ? "✓ CONFIGURADO" : "PENDIENTE"}</span>
        </section>

        <div className="wallet-summary">
          <article className="wallet-card main">
            <small>DISPONIBLE PARA RETIRAR</small>
            <strong>${context.wallet.available.toLocaleString("es-AR")}</strong>
            <p>Retiro mínimo: $5.000</p>
          </article>
          <article className="wallet-card">
            <small>PENDIENTE</small>
            <strong>${context.wallet.pending.toLocaleString("es-AR")}</strong>
            <p>Esperando proveedor</p>
          </article>
          <article className="wallet-card">
            <small>RETENIDO / RETIRADO</small>
            <strong>${context.wallet.held.toLocaleString("es-AR")} / ${context.wallet.withdrawn.toLocaleString("es-AR")}</strong>
            <p>{context.wallet.debt ? `Deuda por reversión: $${context.wallet.debt.toLocaleString("es-AR")}` : "Sin deuda activa"}</p>
          </article>
        </div>

        <div className="wallet-layout">
          <section className="section-card">
            <div className="section-head">
              <div>
                <span className="eyebrow">ÚLTIMOS MOVIMIENTOS</span>
                <h2>Historial verificable</h2>
                <p>Ingresos, pendientes, retiros y reversiones.</p>
              </div>
            </div>
            <div className="transaction-list">
              {movements.map((item: any, index: number) => (
                <div className="transaction" key={item.id}>
                  <span
                    className="transaction-icon"
                    style={{
                      color: ["#69f2b0", "#c4a7ff", "#91caff", "#ffda70", "#69f2b0"][index % 5],
                      background: ["rgba(0,200,111,.12)", "rgba(123,75,232,.14)", "rgba(37,135,232,.14)", "rgba(244,182,31,.13)", "rgba(0,200,111,.12)"][index % 5],
                    }}
                  >
                    <Icon name={item.amount < 0 ? "withdraw" : item.state.startsWith("Pend") ? "clock" : "verified"} size={17}/>
                  </span>
                  <div className="transaction-copy"><strong>{item.label}</strong><small>{item.date}</small></div>
                  <div className="transaction-amount">
                    <strong style={{ color: item.amount > 0 ? "var(--green-2)" : "inherit" }}>
                      {item.amount > 0 ? "+" : "−"}${Math.abs(item.amount).toLocaleString("es-AR")}
                    </strong>
                    <small>{item.state}</small>
                  </div>
                </div>
              ))}
              {!movements.length && <div className="empty-state compact"><h3>Todavía no hay movimientos</h3><p>Cuando una tarea se valide aparecerá aquí.</p></div>}
            </div>
            <div className="wallet-explainer"><strong>¿Por qué una recompensa queda pendiente?</strong><p>El proveedor necesita confirmar las condiciones. Hasta entonces no puede retirarse.</p></div>
          </section>
          <WithdrawalWizard available={context.wallet.available} methods={methods as any[]} realMode={context.configured}/>
        </div>
      </section>
    </AppShell>
  );
}
