import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { GananzaLogo } from "@/components/brand/gananza-logo";

const benefits = [
  {
    icon: "/landing/benefit-earnings.svg",
    title: "Ingresos extra",
    copy: "Completá tareas y sumá recompensas según tu actividad.",
  },
  {
    icon: "/landing/benefit-clarity.svg",
    title: "Todo claro desde el inicio",
    copy: "Sabés qué hacer, cuánto suma y cuándo puede validarse.",
  },
  {
    icon: "/landing/benefit-secure.svg",
    title: "Retiro seguro",
    copy: "Solicitá tu saldo disponible mediante métodos verificados.",
  },
];

const steps = [
  ["Elegí una tarea", "Revisá el objetivo, el tiempo estimado, la vigencia y las condiciones.", "/landing/step-choose.svg"],
  ["Completá el objetivo", "Empezá desde Gananza y seguí el progreso sin perder la atribución.", "/landing/step-complete.svg"],
  ["Esperá la validación", "El proveedor confirma que se cumplió correctamente.", "/landing/step-validate.svg"],
  ["Retirá tu saldo", "Cuando quede disponible, elegí tu método de retiro.", "/landing/step-withdraw.svg"],
];

const states = [
  ["Disponible", "Podés iniciarla ahora.", "available", "/landing/state-available.svg"],
  ["En progreso", "Seguimiento activo.", "progress", "/landing/state-progress.svg"],
  ["Pendiente", "El proveedor valida.", "pending", "/landing/state-pending.svg"],
  ["Confirmada", "Ya suma al saldo.", "confirmed", "/landing/state-confirmed.svg"],
  ["Rechazada", "Motivo informado.", "rejected", "/landing/state-rejected.svg"],
  ["Finalizada", "Cupos cerrados.", "finished", "/landing/state-finished.svg"],
];

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <PublicHeader />
      <main className="launch-page asset-led-landing">
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

          <div className="hero-product asset-hero-product" aria-label="Vista previa visual de Gananza">
            <div className="hero-orbit" aria-hidden="true" />
            <div className="asset-phone-frame">
              <Image className="asset-phone" src="/landing/hero-phone-final.svg" width={520} height={760} alt="Aplicación Gananza mostrando saldo, tarea recomendada y retiros" priority />
            </div>
            <Image className="asset-coins asset-coins-a" src="/landing/hero-coins.svg" width={220} height={180} alt="" aria-hidden="true" priority />
            <Image className="asset-coins asset-coins-b" src="/landing/hero-coins.svg" width={220} height={180} alt="" aria-hidden="true" />
            <div className="asset-verified-pill">
              <span />
              <strong>Tarea verificada</strong>
            </div>
          </div>
        </section>

        <section id="beneficios" className="launch-section public-shell launch-reveal">
          <div className="launch-section-head">
            <span>Beneficios</span>
            <h2>Una experiencia clara para convertir actividad en recompensas.</h2>
          </div>
          <div className="benefit-grid asset-benefit-grid">
            {benefits.map((benefit) => (
              <article className="benefit-tile asset-benefit-tile" key={benefit.title}>
                <div className="benefit-art" aria-hidden="true">
                  <Image src={benefit.icon} width={96} height={96} alt="" />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="launch-section process-section public-shell launch-reveal">
          <div className="launch-section-head">
            <span>Cómo funciona</span>
            <h2>Cuatro pasos conectados, con señales visuales en cada avance.</h2>
          </div>
          <div className="process-track asset-process-track">
            {steps.map(([title, copy, icon], index) => (
              <article className="process-step asset-process-step" key={title} style={{ "--step": index } as CSSProperties}>
                <span className="step-number">0{index + 1}</span>
                <div className="step-icon-crop" aria-hidden="true">
                  <Image src={icon} width={64} height={64} alt="" />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="seguridad" className="launch-section states-section public-shell launch-reveal">
          <div className="launch-section-head">
            <span>Estados</span>
            <h2>Cada recompensa muestra su estado real.</h2>
          </div>
          <div className="state-editorial asset-state-editorial">
            <div className="state-spotlight asset-state-spotlight">
              <Image src="/landing/states-summary.svg" width={220} height={220} alt="" aria-hidden="true" />
              <strong>Seguimiento visible</strong>
              <p>Gananza separa lo disponible, lo pendiente y lo confirmado para que sepas qué podés retirar.</p>
            </div>
            <div className="state-flow asset-state-flow">
              {states.map(([title, copy, tone, icon], index) => (
                <article className={`reward-state asset-reward-state ${tone}`} key={title} style={{ "--state": index } as CSSProperties}>
                  <div className="state-icon-crop" aria-hidden="true">
                    <Image src={icon} width={56} height={56} alt="" />
                  </div>
                  <strong>{title}</strong>
                  <span>{copy}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="launch-final-cta public-shell launch-reveal asset-final-cta">
          <div className="final-cta-copy">
            <span>GANANZA</span>
            <h2>Empezá a generar ingresos extra con Gananza.</h2>
            <p>Encontrá tareas, conocé la recompensa y seguí cada paso hasta que tu saldo esté disponible.</p>
            <Link href="/acceso" className="primary-button">Crear mi cuenta</Link>
            <p className="final-note">Registrarte no tiene costo. Las tareas disponibles pueden variar según perfil y ubicación.</p>
          </div>
          <div className="final-cta-art" aria-hidden="true">
            <Image className="final-visual" src="/landing/cta-final-visual.svg" width={560} height={360} alt="" />
          </div>
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
