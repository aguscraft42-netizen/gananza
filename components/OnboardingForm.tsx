"use client";

import { useState } from "react";
import { saveOnboardingAction } from "@/app/auth/actions";
import { Icon } from "@/components/Icons";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { CategoryIcon, type CategoryIconType } from "@/components/ui/category-icon";

const interests: Array<{ label: string; icon: CategoryIconType; detail: string }> = [
  { label: "Juegos", icon: "games", detail: "Objetivos y progreso" },
  { label: "Encuestas", icon: "surveys", detail: "Opiniones verificadas" },
  { label: "Apps y servicios", icon: "apps-services", detail: "Descargá y probá" },
  { label: "Tareas rápidas", icon: "quick-tasks", detail: "Acciones breves" },
];

type PayoutMethod = "mercado_pago" | "bank_transfer";

export function OnboardingForm({ error }: { error?: string }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>(["Juegos", "Encuestas"]);
  const [method, setMethod] = useState<PayoutMethod>("mercado_pago");

  const progress = `${step * 33.333}%`;

  return (
    <form action={saveOnboardingAction} className="onboarding-card premium-onboarding">
      <div className="onboarding-topline">
        <div className="onboarding-brand-dot" aria-hidden="true" />
        <strong>Gananza</strong>
        <span>{step}/3</span>
      </div>
      <div className="onboarding-progress" aria-label={`Paso ${step} de 3`}><span style={{ width: progress }} /></div>
      <div className="onboarding-step-meta">
        <span>{step === 1 ? "Configuración inicial" : step === 2 ? "Configurá tus retiros" : "Listo para empezar"}</span>
      </div>

      <div className="onboarding-head">
        <h1>{step === 1 ? "¿Qué te interesa ganar hoy?" : step === 2 ? "¿Dónde preferís recibir tu saldo?" : "Todo claro antes de empezar."}</h1>
        <p>
          {step === 1
            ? "Elegí las categorías que más te gustan. Podrás cambiarlas cuando quieras."
            : step === 2
              ? "Elegí el método que más te convenga. Podrás cambiarlo más adelante."
              : "Gananza distingue cada estado para que siempre sepas qué ocurre con tu saldo."}
        </p>
      </div>

      {error && <div className="auth-message error">{error}</div>}
      {selected.map((item) => <input key={item} type="hidden" name="interests" value={item} />)}
      <input type="hidden" name="payout_preference" value={method} />

      {step === 1 && (
        <div className="choice-grid premium-choice-grid">
          {interests.map((item) => {
            const active = selected.includes(item.label);
            return (
              <button
                type="button"
                key={item.label}
                className={active ? "selected" : ""}
                aria-pressed={active}
                onClick={() => setSelected((current) => active ? current.filter((value) => value !== item.label) : [...current, item.label])}
              >
                <CategoryIcon type={item.icon} size={40} selected={active} className="choice-icon" />
                <span className="choice-copy"><strong>{item.label}</strong><small>{item.detail}</small></span>
                <i className="choice-check"><Icon name="check" size={14} /></i>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="choice-grid methods premium-method-choice">
          <button
            type="button"
            className={`payment-choice-card mercado-pago-option ${method === "mercado_pago" ? "selected" : ""}`}
            aria-pressed={method === "mercado_pago"}
            onClick={() => setMethod("mercado_pago")}
          >
            <span className="choice-icon mp-choice"><MercadoPagoLogo compact /></span>
            <span className="choice-copy">
              <span className="choice-title-row"><strong>Mercado Pago</strong><em>Más rápido</em></span>
              <small>Alias o CVU de tu cuenta Mercado Pago</small>
              <span>Retirá de forma simple y con acreditación prioritaria.</span>
            </span>
            <i className="choice-check"><Icon name="check" size={14} /></i>
          </button>
          <button
            type="button"
            className={`payment-choice-card ${method === "bank_transfer" ? "selected" : ""}`}
            aria-pressed={method === "bank_transfer"}
            onClick={() => setMethod("bank_transfer")}
          >
            <CategoryIcon type="other-bank" size={40} selected={method === "bank_transfer"} className="choice-icon" />
            <span className="choice-copy">
              <span className="choice-title-row"><strong>Transferencia a otro banco</strong><em>Puede demorar más</em></span>
              <small>CBU, CVU o alias de otra entidad</small>
              <span>La acreditación puede tardar un poco más según el banco o la billetera.</span>
            </span>
            <i className="choice-check"><Icon name="check" size={14} /></i>
          </button>
          <p className="onboarding-security-note">
            <Icon name="shield" size={18} />
            Tus datos y ganancias están protegidos. Validamos cada retiro antes de procesarlo.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="rules-list premium-rules">
          <article><i><Icon name="filter" size={19} /></i><div><strong>Oportunidades relevantes</strong><p>La disponibilidad depende de país, dispositivo y proveedor.</p></div></article>
          <article><i><Icon name="clock" size={19} /></i><div><strong>Validación antes de acreditar</strong><p>El saldo queda pendiente hasta que el proveedor confirma la tarea.</p></div></article>
          <article><i><Icon name="shield" size={19} /></i><div><strong>Una identidad, una cuenta</strong><p>Los controles antifraude protegen a la comunidad y los pagos.</p></div></article>
        </div>
      )}

      <div className="onboarding-actions">
        {step > 1 && <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>Volver</button>}
        {step < 3
          ? <button type="button" className="primary-button" disabled={step === 1 && selected.length === 0} onClick={() => setStep(step + 1)}>Continuar <Icon name="arrow" size={17} /></button>
          : <button type="submit" className="primary-button">¡Listo! Empezar a ganar <Icon name="arrow" size={17} /></button>}
      </div>
    </form>
  );
}
