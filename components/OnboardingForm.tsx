"use client";

import { useState } from "react";
import { saveOnboardingAction } from "@/app/auth/actions";
import { Icon, type IconName } from "@/components/Icons";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";

const interests: Array<{ label: string; icon: IconName; detail: string }> = [
  { label: "Juegos", icon: "game", detail: "Objetivos y progreso" },
  { label: "Encuestas", icon: "survey", detail: "Opiniones verificadas" },
  { label: "Apps y servicios", icon: "app", detail: "Pruebas y registros" },
  { label: "Tareas rápidas", icon: "sparkles", detail: "Acciones breves" },
];

export function OnboardingForm({ error }: { error?: string }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>(["Juegos", "Encuestas"]);
  const [method, setMethod] = useState("mercado_pago");

  return <form action={saveOnboardingAction} className="onboarding-card premium-onboarding">
    <div className="onboarding-progress" aria-label={`Paso ${step} de 3`}><span style={{ width: `${step * 33.333}%` }} /></div>
    <div className="onboarding-step-meta"><span>Configuración inicial</span><strong>0{step} / 03</strong></div>
    <div className="onboarding-head">
      <span className="eyebrow">{step === 1 ? "PERSONALIZÁ TU EXPERIENCIA" : step === 2 ? "CONFIGURÁ TUS RETIROS" : "TRANSPARENCIA DESDE EL INICIO"}</span>
      <h1>{step === 1 ? "¿Qué oportunidades te interesan?" : step === 2 ? "¿Dónde preferís recibir tu saldo?" : "Todo claro antes de empezar."}</h1>
      <p>{step === 1 ? "Usaremos tus preferencias para ordenar el catálogo, sin limitar lo que podés explorar." : step === 2 ? "Podrás cambiar este método más adelante desde tu perfil." : "Gananza distingue cada estado para que siempre sepas qué ocurre con tu saldo."}</p>
    </div>
    {error && <div className="auth-message error">{error}</div>}
    {selected.map((item) => <input key={item} type="hidden" name="interests" value={item}/>)}
    <input type="hidden" name="payout_preference" value={method}/>

    {step === 1 && <div className="choice-grid premium-choice-grid">{interests.map((item) => {
      const active = selected.includes(item.label);
      return <button type="button" key={item.label} className={active ? "selected" : ""} onClick={() => setSelected((current) => active ? current.filter((value) => value !== item.label) : [...current, item.label])}>
        <span className="choice-icon"><Icon name={item.icon} size={23}/></span>
        <span className="choice-copy"><strong>{item.label}</strong><small>{item.detail}</small></span>
        <i className="choice-check"><Icon name="check" size={14}/></i>
      </button>;
    })}</div>}

    {step === 2 && <div className="choice-grid methods premium-method-choice">
      <button type="button" className={method === "mercado_pago" ? "selected" : ""} onClick={() => setMethod("mercado_pago")}>
        <span className="choice-icon mp-choice"><MercadoPagoLogo compact /></span>
        <span className="choice-copy"><strong>Mercado Pago</strong><small>Alias o CVU · Recomendado</small></span>
        <i className="choice-check"><Icon name="check" size={14}/></i>
      </button>
      <button type="button" className={method === "bank_transfer" ? "selected" : ""} onClick={() => setMethod("bank_transfer")}>
        <span className="choice-icon"><Icon name="money" size={23}/></span>
        <span className="choice-copy"><strong>Transferencia bancaria</strong><small>CBU o CVU personal</small></span>
        <i className="choice-check"><Icon name="check" size={14}/></i>
      </button>
    </div>}

    {step === 3 && <div className="rules-list premium-rules">
      <article><i><Icon name="filter" size={19}/></i><div><strong>Oportunidades relevantes</strong><p>La disponibilidad depende de país, dispositivo y proveedor.</p></div></article>
      <article><i><Icon name="clock" size={19}/></i><div><strong>Validación antes de acreditar</strong><p>El saldo queda pendiente hasta que el proveedor confirma la tarea.</p></div></article>
      <article><i><Icon name="shield" size={19}/></i><div><strong>Una identidad, una cuenta</strong><p>Los controles antifraude protegen a la comunidad y los pagos.</p></div></article>
    </div>}

    <div className="onboarding-actions">
      {step > 1 && <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>Volver</button>}
      {step < 3
        ? <button type="button" className="primary-button" disabled={step === 1 && selected.length === 0} onClick={() => setStep(step + 1)}>Continuar <Icon name="arrow" size={17}/></button>
        : <button type="submit" className="primary-button">Entrar a Gananza <Icon name="arrow" size={17}/></button>}
    </div>
  </form>;
}
