"use client";

import { useMemo, useState } from "react";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { Icon } from "@/components/Icons";

type Method = {
  id: string;
  method_type: string;
  label: string;
  destination_masked: string;
  holder_name?: string | null;
  is_default?: boolean;
  is_verified?: boolean;
  cooldown_until?: string | null;
};

function statusCopy(method?: Method) {
  if (!method) return "";
  if (method.is_verified) return "Destino verificado";
  if (method.cooldown_until && new Date(method.cooldown_until).getTime() > Date.now()) return "Destino nuevo: revisión de seguridad activa";
  return "El primer retiro se revisa manualmente";
}

export function WithdrawalWizard({ available, methods, realMode }: { available: number; methods: Method[]; realMode: boolean }) {
  const orderedMethods = useMemo(
    () => [...methods].sort((a, b) => Number(b.method_type === "mercado_pago") - Number(a.method_type === "mercado_pago") || Number(b.is_default) - Number(a.is_default)),
    [methods],
  );
  const [step, setStep] = useState(1);
  const [methodId, setMethodId] = useState(orderedMethods[0]?.id || "");
  const [amount, setAmount] = useState(Math.min(5000, available));
  const [receiptId, setReceiptId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const method = useMemo(() => orderedMethods.find((item) => item.id === methodId), [orderedMethods, methodId]);
  const valid = amount >= 5000 && amount <= available && Boolean(methodId);
  const isMercadoPago = method?.method_type === "mercado_pago";

  async function submitWithdrawal() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount, payoutMethodId: methodId, idempotencyKey: crypto.randomUUID() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos crear el retiro");
      setReceiptId(result.withdrawal?.id || result.id || `GNZ-${Date.now()}`);
      setStep(4);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos enviar la solicitud.");
    } finally {
      setBusy(false);
    }
  }

  if (!methods.length) {
    return (
      <aside className="section-card withdrawal-panel withdrawal-empty">
        <MercadoPagoLogo className="withdrawal-empty-logo" />
        <span className="eyebrow">RETIROS</span>
        <h2>Agregá Mercado Pago.</h2>
        <p>Registrá tu alias o CVU, titular y documento para solicitar retiros cuando tengas saldo confirmado.</p>
        <a className="primary-button button-wide" href="/perfil">Agregar Mercado Pago</a>
      </aside>
    );
  }

  if (step === 4) {
    return (
      <aside className="section-card withdrawal-panel success-panel">
        <div className="success-check"><Icon name="verified" size={28} /></div>
        {isMercadoPago && <MercadoPagoLogo className="withdrawal-success-logo" />}
        <span className="eyebrow">SOLICITUD ENVIADA</span>
        <h2>Tu retiro está en revisión.</h2>
        <p>
          Retiro de <strong>${amount.toLocaleString("es-AR")}</strong> a {method?.label}. {realMode ? "El saldo quedó retenido de forma transaccional." : "En esta demo no se mueve dinero real."}
        </p>
        <div className="withdrawal-timeline compact-timeline">
          <div className="done"><i><Icon name="check" size={14}/></i><span><strong>Solicitado</strong><small>Saldo retenido</small></span></div>
          <div className="active"><i>2</i><span><strong>Revisión</strong><small>Identidad y destino</small></span></div>
          <div><i>3</i><span><strong>Transferencia</strong><small>Comprobante y referencia</small></span></div>
        </div>
        <div className="receipt-box">
          <div><span>Identificador</span><strong>{receiptId.slice(0, 18)}</strong></div>
          <div><span>Estado</span><strong className="state-pending">En revisión</strong></div>
          <div><span>Destino</span><strong>{method?.destination_masked}</strong></div>
          <div><span>Plazo informado</span><strong>Hasta 48 h hábiles</strong></div>
        </div>
        <button className="secondary-button button-wide" onClick={() => { setStep(1); setReceiptId(""); }}>Volver</button>
      </aside>
    );
  }

  return (
    <aside className="section-card withdrawal-panel">
      <div className="section-head withdrawal-title-row">
        <div>
          <span className="eyebrow">{realMode ? "RETIRO PROTEGIDO" : "RETIRO SIMULADO"}</span>
          <h2>{step === 1 ? "Elegí el destino" : step === 2 ? "Indicá el importe" : "Revisá la solicitud"}</h2>
          <p>Paso {step} de 3</p>
        </div>
        {isMercadoPago && <MercadoPagoLogo compact className="withdrawal-header-logo" />}
      </div>

      <div className="withdraw-steps" aria-label={`Paso ${step} de 3`}>
        <span className={step >= 1 ? "active" : ""}>1</span><i className={step >= 2 ? "active" : ""}/>
        <span className={step >= 2 ? "active" : ""}>2</span><i className={step >= 3 ? "active" : ""}/>
        <span className={step >= 3 ? "active" : ""}>3</span>
      </div>

      {step === 1 && (
        <div className="method-grid">
          {orderedMethods.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`method-card ${item.method_type === "mercado_pago" ? "mercado-pago-card" : ""} ${methodId === item.id ? "selected" : ""}`}
              onClick={() => setMethodId(item.id)}
            >
              <span className={`method-icon ${item.method_type === "mercado_pago" ? "mp branded" : "bank"}`}>
                {item.method_type === "mercado_pago" ? <MercadoPagoLogo compact /> : <Icon name="money" size={21}/>}
              </span>
              <div>
                <strong>{item.label}{item.method_type === "mercado_pago" && <em className="recommended-tag">Recomendado</em>}</strong>
                <small>{item.destination_masked}</small>
                <small className="method-security-copy">{statusCopy(item)}</small>
              </div>
              <i><Icon name="check" size={14}/></i>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="form-stack">
          {isMercadoPago && (
            <div className="selected-provider-banner">
              <MercadoPagoLogo />
              <div><strong>Retiro a Mercado Pago</strong><small>{method?.destination_masked} · {method?.holder_name || "Titular registrado"}</small></div>
            </div>
          )}
          <label>
            Monto a retirar
            <div className="money-input"><span>$</span><input type="number" min={5000} max={available} step={100} value={amount} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(event.target.value))}/></div>
            <small>Disponible: ${available.toLocaleString("es-AR")} · Mínimo: $5.000</small>
          </label>
          <div className="quick-amounts">
            <button type="button" onClick={() => setAmount(Math.min(5000, available))}>$5.000</button>
            <button type="button" onClick={() => setAmount(Math.min(7000, available))}>$7.000</button>
            <button type="button" onClick={() => setAmount(available)}>Todo</button>
          </div>
          {!valid && <p className="form-error">El monto debe estar entre $5.000 y tu saldo disponible.</p>}
          <div className="withdraw-security-box"><span><Icon name="shield" size={19}/></span><p>El destino no puede editarse durante el retiro. Los cambios recientes activan una revisión de seguridad.</p></div>
        </div>
      )}

      {step === 3 && (
        <div className="withdraw-review">
          <div className="review-provider-row"><span>Método</span><strong>{isMercadoPago ? <><MercadoPagoLogo compact /> Mercado Pago</> : method?.label}</strong></div>
          <div><span>Destino</span><strong>{method?.destination_masked}</strong></div>
          <div><span>Titular</span><strong>{method?.holder_name || "Registrado"}</strong></div>
          <div><span>Importe</span><strong>${amount.toLocaleString("es-AR")}</strong></div>
          <div><span>Comisión de Gananza</span><strong>$0</strong></div>
          <div className="review-total"><span>Total solicitado</span><strong>${amount.toLocaleString("es-AR")}</strong></div>
          <p>Al confirmar, el importe pasa de disponible a retenido. El equipo valida la cuenta y, al transferir, registra la referencia y el comprobante.</p>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      <div className="withdraw-actions">
        {step > 1 && <button className="secondary-button" type="button" onClick={() => setStep(step - 1)}>Volver</button>}
        {step < 3
          ? <button className="primary-button" type="button" disabled={step === 2 && !valid} onClick={() => setStep(step + 1)}>Continuar</button>
          : <button className="primary-button" type="button" disabled={busy || !valid} onClick={submitWithdrawal}>{busy ? "Enviando…" : `Confirmar retiro${isMercadoPago ? " a Mercado Pago" : ""}`}</button>}
      </div>
      <p className="provider-disclaimer">Mercado Pago es un servicio externo. Gananza identifica el destino, pero no implica asociación comercial ni procesa el pago dentro de Mercado Pago.</p>
    </aside>
  );
}
