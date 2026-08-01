import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { GananzaLogo } from "@/components/brand/gananza-logo";
import { LandingCountUp } from "@/components/LandingCountUp";

const benefits = [
  {
    icon: "/landing/earnings.svg",
    title: "Ingresos extra",
    copy: "Completá tareas y sumá recompensas según tu actividad.",
  },
  {
    icon: "/landing/transparent-rewards.svg",
    title: "Todo claro desde el inicio",
    copy: "Sabés qué hacer, cuánto suma y cuándo puede validarse.",
  },
  {
    icon: "/landing/secure-withdrawal.svg",
    title: "Retiro seguro",
    copy: "Solicitá tu saldo disponible mediante métodos verificados.",
  },
];

const steps = [
  ["Elegí una tarea", "Revisá las condiciones y la recompensa.", "/landing/tasks.svg"],
  ["Completá el objetivo", "Seguí las instrucciones sin perder la atribución.", "/landing/progress.svg"],
  ["Esperá la validación", "El proveedor confirma que se cumplió correctamente.", "/landing/verified-status.svg"],
  ["Retirá tu saldo", "Cuando quede disponible, elegí tu método de retiro.", "/landing/secure-withdrawal.svg"],
];

const states = [
  ["Disponible", "Podés iniciarla ahora.", "available"],
  ["En progreso", "Seguimiento activo.", "progress"],
  ["Pendiente", "El proveedor valida.", "pending"],
  ["Confirmada", "Ya suma al saldo.", "confirmed"],
  ["Rechazada", "Motivo informado.", "rejected"],
  ["Finalizada", "Cupos cerrados.", "finished"],
];

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <PublicHeader />
      <main className="launch-page">
        <section className="launch-hero public-shell">
          <div className="hero-copy launch-reveal">
            <p className="hero-benefit">GENERÁ INGRESOS EXTRA</p>
            <h1>Tu tiempo también puede sumar.</h1>
            <p className="hero-subtitle">Completá tareas, encuestas y desafíos. Conocé la recompensa antes de empezar y retirá tu saldo cuando quede disponible.</p>
            <div className="launch-actions">
              <Link href="/acceso" className="primary-button hero-primary">Empezar a ganar</Link>
              <Link href="#como-funciona" className="secondary-button">Ver cómo funciona</Link>
            </div>
            <div className="hero-claims" aria-label="Beneficios principales">
              <span>Tareas claras</span>
              <span>Recompensas visibles</span>
              <span>Retiros verificados</span>
            </div>
            <p className="hero-disclaimer">Las recompensas dependen de completar y validar cada tarea. Gananza no garantiza ingresos fijos.</p>
          </div>

          <div className="hero-product" aria-label="Vista previa del producto Gananza">
            <div className="hero-orbit" aria-hidden="true" />
            <Image className="hero-coins coins-a" src="/landing/hero-coins.svg" width={220} height={160} alt="" aria-hidden="true" priority />
            <Image className="hero-ring" src="/landing/hero-progress-ring.svg" width={160} height={160} alt="" aria-hidden="true" priority />
            <article className="hero-phone" aria-label="Mockup de saldo y tareas">
              <div className="phone-speaker" />
              <div className="phone-top">
                <span>Hola, Agus</span>
                <i />
              </div>
              <div className="phone-balance-panel">
                <small>Saldo disponible</small>
                <strong><LandingCountUp value={8650} /></strong>
                <button type="button">Retirar saldo</button>
              </div>
              <div className="phone-task-panel">
                <span>Tarea destacada</span>
                <h3>Encuesta de opinión</h3>
                <p>75 min · validación por proveedor</p>
                <div><b>+$650</b><em>Disponible</em></div>
              </div>
              <div className="phone-progress">
                <span><b>68%</b> progreso</span>
                <i><u /></i>
              </div>
            </article>
            <Image className="floating-card balance-float" src="/landing/hero-balance-card.svg" width={260} height={152} alt="Tarjeta visual de saldo disponible" />
            <Image className="floating-card task-float" src="/landing/hero-task-card.svg" width={270} height={143} alt="Tarjeta visual de tarea recomendada" />
          </div>
        </section>

        <section id="beneficios" className="launch-section public-shell launch-reveal">
          <div className="launch-section-head">
            <span>Beneficios</span>
            <h2>Una forma simple y controlada de sumar valor con tu actividad.</h2>
          </div>
          <div className="benefit-grid">
            {benefits.map((benefit) => (
              <article className="benefit-tile" key={benefit.title}>
                <Image src={benefit.icon} width={58} height={58} alt="" aria-hidden="true" />
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="launch-section process-section public-shell launch-reveal">
          <div className="launch-section-head">
            <span>Cómo funciona</span>
            <h2>Cuatro pasos conectados, sin saldos ambiguos.</h2>
          </div>
          <div className="process-track">
            {steps.map(([title, copy, icon], index) => (
              <article className="process-step" key={title} style={{ "--step": index } as CSSProperties}>
                <span className="step-number">0{index + 1}</span>
                <Image src={icon} width={42} height={42} alt="" aria-hidden="true" />
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="seguridad" className="launch-section states-section public-shell launch-reveal">
          <div className="launch-section-head">
            <span>Estados de recompensa</span>
            <h2>Cada tarea muestra dónde está tu recompensa.</h2>
          </div>
          <div className="state-editorial">
            <div className="state-spotlight">
              <Image src="/landing/verified-status.svg" width={72} height={72} alt="" aria-hidden="true" />
              <strong>Seguimiento visible</strong>
              <p>Gananza separa lo disponible, lo pendiente y lo confirmado para que sepas qué podés retirar.</p>
            </div>
            <div className="state-flow">
              {states.map(([title, copy, tone], index) => (
                <article className={`reward-state ${tone}`} key={title} style={{ "--state": index } as CSSProperties}>
                  <i aria-hidden="true" />
                  <strong>{title}</strong>
                  <span>{copy}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="launch-final-cta public-shell launch-reveal">
          <div>
            <span>GANANZA</span>
            <h2>Empezá a generar ingresos extra con Gananza.</h2>
            <p>Encontrá tareas, conocé la recompensa y seguí cada paso hasta que tu saldo esté disponible.</p>
            <Link href="/acceso" className="primary-button">Crear mi cuenta</Link>
          </div>
          <p className="final-note">Registrarte no tiene costo. Las tareas disponibles varían según perfil y ubicación.</p>
        </section>
      </main>

      <footer className="launch-footer public-shell">
        <GananzaLogo variant="logo" size={34} />
        <nav aria-label="Enlaces legales">
          <Link href="/acceso">Términos</Link>
          <Link href="/acceso">Privacidad</Link>
          <Link href="/soporte">Soporte</Link>
        </nav>
        <span>Argentina · {year}</span>
      </footer>
    </>
  );
}
