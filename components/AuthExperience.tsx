"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordResetAction, signInAction, signUpAction } from "@/app/auth/actions";
import { Icon } from "@/components/Icons";

const interests = ["Juegos", "Encuestas", "Apps y servicios", "Tareas rápidas"];

type AuthMode = "login" | "register" | "reset";

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
  const [method, setMethod] = useState("Mercado Pago");

  if (!configured) {
    if (stage === "done") return <div className="auth-success"><div className="success-check"><Icon name="verified" size={28}/></div><span className="eyebrow">PERFIL DEMO LISTO</span><h1>Todo preparado, Agustín.</h1><p>Personalizamos la demo con tareas, estados y un método de retiro simulado.</p><Link href="/dashboard" className="primary-button">Entrar a Gananza</Link><button className="text-button" onClick={() => { setStage("auth"); setStep(1); }}>Volver a empezar</button></div>;

    if (stage === "onboarding") return <div className="onboarding-card">
      <div className="onboarding-progress"><span style={{ width: `${step * 33.333}%` }} /></div>
      <div className="onboarding-head"><span className="eyebrow">PASO {step} DE 3</span><h1>{step === 1 ? "¿Qué tareas te interesan?" : step === 2 ? "¿Cómo preferís retirar?" : "Reglas claras desde el inicio"}</h1><p>{step === 1 ? "Esto nos ayuda a ordenar primero las oportunidades relevantes." : step === 2 ? "Podrás cambiarlo más adelante desde tu perfil." : "Gananza muestra el estado real de cada recompensa."}</p></div>
      {step === 1 && <div className="choice-grid">{interests.map((item) => <button type="button" key={item} className={selected.includes(item) ? "selected" : ""} onClick={() => setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}><span><Icon name={item === "Juegos" ? "game" : item === "Encuestas" ? "survey" : item === "Apps y servicios" ? "app" : "sparkles"}/></span><strong>{item}</strong><i><Icon name="check" size={14}/></i></button>)}</div>}
      {step === 2 && <div className="choice-grid methods"><button type="button" className={method === "Mercado Pago" ? "selected" : ""} onClick={() => setMethod("Mercado Pago")}><span>MP</span><strong>Mercado Pago</strong><i><Icon name="check" size={14}/></i></button><button type="button" className={method === "Transferencia" ? "selected" : ""} onClick={() => setMethod("Transferencia")}><span><Icon name="money"/></span><strong>Transferencia</strong><i><Icon name="check" size={14}/></i></button></div>}
      {step === 3 && <div className="rules-list"><article><i>1</i><div><strong>Las tareas pueden variar</strong><p>La disponibilidad depende del país, dispositivo y proveedor.</p></div></article><article><i>2</i><div><strong>Pendiente no significa disponible</strong><p>La recompensa se libera cuando el proveedor confirma la acción.</p></div></article><article><i>3</i><div><strong>Una persona, una cuenta</strong><p>VPN, emuladores y cuentas duplicadas pueden invalidar pagos.</p></div></article></div>}
      <div className="onboarding-actions">{step > 1 && <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>Volver</button>}<button type="button" className="primary-button" disabled={step === 1 && selected.length === 0} onClick={() => step < 3 ? setStep(step + 1) : setStage("done")}>{step === 3 ? "Aceptar y continuar" : "Continuar"}</button></div>
    </div>;
  }

  const action = mode === "register" ? signUpAction : mode === "reset" ? requestPasswordResetAction : signInAction;
  return <div className="auth-card">
    <div className="auth-tabs"><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Crear cuenta</button><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Ingresar</button></div>
    <span className="eyebrow">SUPABASE READY</span><h1>{mode === "register" ? "Empezá a sumar con claridad." : mode === "reset" ? "Recuperá el acceso." : "Qué bueno verte de nuevo."}</h1><p>{mode === "register" ? "Creá tu cuenta real. Si la verificación está activa, te enviaremos un correo." : mode === "reset" ? "Ingresá tu correo y te enviaremos un enlace seguro." : "Ingresá a tu cuenta para ver tareas, movimientos y retiros."}</p>
    {error && <div className="auth-message error">{error}</div>}
    {checkEmail && <div className="auth-message success">Cuenta creada. Revisá tu correo para verificarla.</div>}
    {resetSent && <div className="auth-message success">Si el correo existe, enviamos un enlace de recuperación.</div>}
    <form action={action} className="auth-form">
      <input type="hidden" name="next" value={next}/>
      {mode === "register" && <label>Nombre<input name="display_name" required minLength={2} autoComplete="name" /></label>}
      <label>Correo electrónico<input name="email" required type="email" autoComplete="email" /></label>
      {mode !== "reset" && <label>Contraseña<div className="password-field"><input name="password" required minLength={mode === "register" ? 8 : 6} type="password" autoComplete={mode === "register" ? "new-password" : "current-password"}/></div></label>}
      {mode === "register" && <label className="check-line"><input name="accepted_terms" required type="checkbox"/><span>Acepto los términos y la política de privacidad.</span></label>}
      <button className="primary-button button-wide" type="submit">{mode === "register" ? "Crear cuenta" : mode === "reset" ? "Enviar enlace" : "Ingresar"}</button>
    </form>
    {mode === "login" && <button type="button" className="text-button auth-reset-link" onClick={() => setMode("reset")}>Olvidé mi contraseña</button>}
    {mode === "reset" && <button type="button" className="text-button auth-reset-link" onClick={() => setMode("login")}>Volver a ingresar</button>}
    <div className="auth-security"><span><Icon name="shield" size={18}/></span><p><strong>Sesión protegida.</strong> Supabase Auth usa cookies seguras y RLS protege los datos.</p></div>
  </div>;
}
