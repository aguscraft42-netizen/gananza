"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordResetAction, signInAction, signUpAction } from "@/app/auth/actions";
import { Icon } from "@/components/Icons";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { CategoryIcon, type CategoryIconType } from "@/components/ui/category-icon";

const interests: Array<{ label: string; icon: CategoryIconType; detail: string }> = [
  { label: "Juegos", icon: "games", detail: "Objetivos y progreso" },
  { label: "Encuestas", icon: "surveys", detail: "Opiniones verificadas" },
  { label: "Apps y servicios", icon: "apps-services", detail: "Descargá y probá" },
  { label: "Tareas rápidas", icon: "quick-tasks", detail: "Acciones breves" },
];

type AuthMode = "login" | "register" | "reset";
type DemoMethod = "mercado_pago" | "bank_transfer";

type Props = {
  configured: boolean;
  initialMode?: AuthMode;
  error?: string;
  checkEmail?: boolean;
  resetSent?: boolean;
  next?: string;
};

export function AuthExperience({ configured, initialMode = "register", error, checkEmail, resetSent, next = "/dashboard" }: Props) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [stage, setStage] = useState<"auth" | "onboarding" | "done">("auth");
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>(["Juegos", "Encuestas"]);
  const [method, setMethod] = useState<DemoMethod>("mercado_pago");

  if (!configured) {
    if (stage === "done") return <div className="auth-success"><div className="success-check"><Icon name="verified" size={28} /></div><span className="eyebrow">PERFIL DEMO LISTO</span><h1>Todo preparado, Agustín.</h1><p>Personalizamos la demo con tareas, estados y un método de retiro simulado.</p><Link href="/dashboard" className="primary-button">Entrar a Gananza</Link><button className="text-button" onClick={() => { setStage("auth"); setStep(1); }}>Volver a empezar</button></div>;

    if (stage === "onboarding") return (
      <div className="onboarding-card premium-onboarding">
        <div className="onboarding-topline"><div className="onboarding-brand-dot" aria-hidden="true" /><strong>Gananza</strong><span>{step}/3</span></div>
        <div className="onboarding-progress"><span style={{ width: `${step * 33.333}%` }} /></div>
        <div className="onboarding-step-meta"><span>{step === 1 ? "Configuración inicial" : step === 2 ? "Configurá tus retiros" : "Listo para empezar"}</span></div>
        <div className="onboarding-head">
          <h1>{step === 1 ? "¿Qué te interesa ganar hoy?" : step === 2 ? "¿Dónde preferís recibir tu saldo?" : "Todo claro antes de empezar."}</h1>
          <p>{step === 1 ? "Elegí las categorías que más te gustan. Podrás cambiarlas cuando quieras." : step === 2 ? "Elegí el método que más te convenga. Podrás cambiarlo más adelante." : "Gananza muestra el estado real de cada recompensa y valida cada retiro antes de procesarlo."}</p>
        </div>
        {step === 1 && (
          <div className="choice-grid premium-choice-grid">
            {interests.map((item) => {
              const active = selected.includes(item.label);
              return (
                <button type="button" key={item.label} className={active ? "selected" : ""} aria-pressed={active} onClick={() => setSelected((current) => active ? current.filter((value) => value !== item.label) : [...current, item.label])}>
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
            <button type="button" className={`payment-choice-card mercado-pago-option ${method === "mercado_pago" ? "selected" : ""}`} aria-pressed={method === "mercado_pago"} onClick={() => setMethod("mercado_pago")}>
              <span className="choice-icon mp-choice"><MercadoPagoLogo compact /></span>
              <span className="choice-copy"><span className="choice-title-row"><strong>Mercado Pago</strong><em>Más rápido</em></span><small>Alias o CVU de tu cuenta Mercado Pago</small><span>Retirá de forma simple y con acreditación prioritaria.</span></span>
              <i className="choice-check"><Icon name="check" size={14} /></i>
            </button>
            <button type="button" className={`payment-choice-card ${method === "bank_transfer" ? "selected" : ""}`} aria-pressed={method === "bank_transfer"} onClick={() => setMethod("bank_transfer")}>
              <CategoryIcon type="other-bank" size={40} selected={method === "bank_transfer"} className="choice-icon" />
              <span className="choice-copy"><span className="choice-title-row"><strong>Transferencia a otro banco</strong><em>Puede demorar más</em></span><small>CBU, CVU o alias de otra entidad</small><span>La acreditación puede tardar un poco más según el banco o la billetera.</span></span>
              <i className="choice-check"><Icon name="check" size={14} /></i>
            </button>
            <p className="onboarding-security-note"><Icon name="shield" size={18} />Tus datos y ganancias están protegidos. Validamos cada retiro antes de procesarlo.</p>
          </div>
        )}
        {step === 3 && <div className="rules-list premium-rules"><article><i><Icon name="filter" size={19} /></i><div><strong>Oportunidades relevantes</strong><p>La disponibilidad depende de país, dispositivo y proveedor.</p></div></article><article><i><Icon name="clock" size={19} /></i><div><strong>Validación antes de acreditar</strong><p>El saldo queda pendiente hasta que el proveedor confirma la tarea.</p></div></article><article><i><Icon name="shield" size={19} /></i><div><strong>Una identidad, una cuenta</strong><p>Los controles antifraude protegen a la comunidad y los pagos.</p></div></article></div>}
        <div className="onboarding-actions">{step > 1 && <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>Volver</button>}<button type="button" className="primary-button" disabled={step === 1 && selected.length === 0} onClick={() => step < 3 ? setStep(step + 1) : setStage("done")}>{step === 3 ? "¡Listo! Empezar a ganar" : "Continuar"}</button></div>
      </div>
    );
  }

  const action = mode === "register" ? signUpAction : mode === "reset" ? requestPasswordResetAction : signInAction;
  return <div className="auth-card">
    <div className="auth-tabs"><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Crear cuenta</button><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Ingresar</button></div>
    <span className="eyebrow">SUPABASE READY</span><h1>{mode === "register" ? "Empezá a sumar con claridad." : mode === "reset" ? "Recuperá el acceso." : "Qué bueno verte de nuevo."}</h1><p>{mode === "register" ? "Creá tu cuenta real. Si la verificación está activa, te enviaremos un correo." : mode === "reset" ? "Ingresá tu correo y te enviaremos un enlace seguro." : "Ingresá a tu cuenta para ver tareas, movimientos y retiros."}</p>
    {!configured && <button type="button" className="primary-button button-wide demo-start-button" onClick={() => setStage("onboarding")}>Probar demo sin cuenta</button>}
    {error && <div className="auth-message error">{error}</div>}
    {checkEmail && <div className="auth-message success">Cuenta creada. Revisá tu correo para verificarla.</div>}
    {resetSent && <div className="auth-message success">Si el correo existe, enviamos un enlace de recuperación.</div>}
    <form action={action} className="auth-form">
      <input type="hidden" name="next" value={next} />
      {mode === "register" && <label>Nombre<input name="display_name" required minLength={2} autoComplete="name" /></label>}
      <label>Correo electrónico<input name="email" required type="email" autoComplete="email" /></label>
      {mode !== "reset" && <label>Contraseña<div className="password-field"><input name="password" required minLength={mode === "register" ? 8 : 6} type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} /></div></label>}
      {mode === "register" && <label className="check-line"><input name="accepted_terms" required type="checkbox" /><span>Acepto los términos y la política de privacidad.</span></label>}
      <button className="primary-button button-wide" type="submit">{mode === "register" ? "Crear cuenta" : mode === "reset" ? "Enviar enlace" : "Ingresar"}</button>
    </form>
    {mode === "login" && <button type="button" className="text-button auth-reset-link" onClick={() => setMode("reset")}>Olvidé mi contraseña</button>}
    {mode === "reset" && <button type="button" className="text-button auth-reset-link" onClick={() => setMode("login")}>Volver a ingresar</button>}
    <div className="auth-security"><span><Icon name="shield" size={18} /></span><p><strong>Sesión protegida.</strong> Supabase Auth usa cookies seguras y RLS protege los datos.</p></div>
  </div>;
}
