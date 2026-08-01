import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { GananzaLogo } from "@/components/brand/gananza-logo";

const steps = [
  ["Eleg\u00ed", "Revis\u00e1 el objetivo, el tiempo estimado, la vigencia y las condiciones.", "/landing/final/step-choose.svg"],
  ["Complet\u00e1", "Empez\u00e1 desde Gananza y segu\u00ed el progreso sin perder la atribuci\u00f3n.", "/landing/final/step-complete.svg"],
  ["Valid\u00e1", "La recompensa queda pendiente hasta que el proveedor confirma la acci\u00f3n.", "/landing/final/step-validate.svg"],
  ["Retir\u00e1", "Cuando queda disponible, eleg\u00eds el m\u00e9todo y revis\u00e1s la solicitud.", "/landing/final/step-withdraw.svg"],
];

const states = [
  ["Disponible", "Pod\u00e9s iniciarla ahora.", "available", "/landing/final/state-available.svg"],
  ["En progreso", "Gananza guarda el seguimiento.", "progress", "/landing/final/state-progress.svg"],
  ["Pendiente", "El proveedor est\u00e1 validando.", "pending", "/landing/final/state-pending.svg"],
  ["Confirmada", "Ya forma parte del saldo.", "confirmed", "/landing/final/state-confirmed.svg"],
  ["Rechazada", "Se informa el motivo y soporte.", "rejected", "/landing/final/state-rejected.svg"],
  ["Finalizada", "La oportunidad termin\u00f3 o agot\u00f3 cupos.", "finished", "/landing/final/state-finished.svg"],
];

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <PublicHeader />
      <main className="launch-page asset-led-landing final-reference-landing">
        <section className="launch-hero public-shell">
          <div className="hero-copy launch-reveal">
            <p className="hero-kicker">TAREAS CLARAS. RECOMPENSAS TRANSPARENTES.</p>
            <p className="hero-benefit">GENER&Aacute; INGRESOS EXTRA</p>
            <h1>
              Tu tiempo
              <br />
              <span className="headline-mid">tambi&eacute;n puede</span>
              <br />
              <span>sumar.</span>
            </h1>
            <p className="hero-subtitle">
              Complet&aacute; encuestas, prob&aacute; juegos y descubr&iacute; servicios. Antes de empezar vas a saber qu&eacute; hacer,
              cu&aacute;nto suma y cu&aacute;ndo se valida.
            </p>
            <div className="hero-claims" aria-label="Beneficios principales">
              <span>Tareas transparentes</span>
              <span>Estados visibles</span>
              <span>Retiros revisados</span>
            </div>
            <div className="launch-actions">
              <Link href="/acceso" className="primary-button hero-primary">Probar Gananza</Link>
              <Link href="#como-funciona" className="secondary-button">C&oacute;mo funciona</Link>
            </div>
            <p className="hero-disclaimer">
              Gananza no promete ingresos garantizados. Cada recompensa depende de completar y validar la tarea.
            </p>
          </div>

          <div className="hero-product asset-hero-product" aria-label="Vista previa visual de Gananza">
            <Image className="hero-layer hero-soft-glow" src="/landing/final/hero-glow.svg" width={760} height={620} alt="" aria-hidden="true" priority />
            <Image className="hero-layer hero-orbit-left" src="/landing/final/hero-orbit-left.svg" width={720} height={520} alt="" aria-hidden="true" priority />
            <Image className="hero-layer hero-orbit-right" src="/landing/final/hero-orbit-right.svg" width={720} height={520} alt="" aria-hidden="true" priority />
            <Image className="hero-layer hero-coin coin-left" src="/landing/final/hero-coin-large.svg" width={86} height={86} alt="" aria-hidden="true" priority />
            <Image className="hero-layer hero-coin coin-top" src="/landing/final/hero-coin-medium.svg" width={72} height={72} alt="" aria-hidden="true" priority />
            <Image className="hero-layer hero-coin coin-right" src="/landing/final/hero-coin-medium.svg" width={70} height={70} alt="" aria-hidden="true" priority />
            <Image className="hero-layer hero-coin-stack" src="/landing/final/hero-coin-stack.svg" width={132} height={92} alt="" aria-hidden="true" priority />
            <Image className="asset-phone" src="/landing/final/hero-phone.svg" width={470} height={640} alt="Aplicaci\u00f3n Gananza mostrando saldo, tarea recomendada y retiros" priority />
          </div>
        </section>

        <section id="como-funciona" className="launch-section process-section public-shell launch-reveal">
          <h2 className="reference-section-title">&iquest;C&oacute;mo funciona?</h2>
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
          <h2 className="reference-section-title states-title">Cada tarea muestra su estado real.</h2>
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
        </section>

        <section className="launch-final-cta public-shell launch-reveal asset-final-cta">
          <div className="final-cta-art" aria-hidden="true">
            <Image className="cta-wallet" src="/landing/final/cta-wallet.svg" width={260} height={160} alt="" />
            <Image className="cta-coins" src="/landing/final/cta-coins.svg" width={250} height={145} alt="" />
          </div>
          <div className="final-cta-copy">
            <h2>Empez&aacute; a generar ingresos extra con Gananza.</h2>
            <p>Explor&aacute; tareas, conoc&eacute; la recompensa antes de empezar y segu&iacute; cada estado hasta que tu saldo est&eacute; disponible.</p>
            <Link href="/acceso" className="primary-button">Crear mi cuenta</Link>
          </div>
          <div className="final-cta-note">
            <Image src="/landing/final/utility-security.svg" width={42} height={42} alt="" aria-hidden="true" />
            <p>Sin costos de registro. Las tareas disponibles pueden variar seg&uacute;n el perfil y la ubicaci&oacute;n.</p>
          </div>
          <Image className="cta-growth" src="/landing/final/cta-growth-line.svg" width={380} height={150} alt="" aria-hidden="true" />
        </section>
      </main>

      <footer className="launch-footer public-shell">
        <GananzaLogo variant="logo" size={34} />
        <span>&copy; {year} Gananza. Todos los derechos reservados.</span>
        <nav aria-label="Enlaces legales">
          <Link href="/acceso">T&eacute;rminos y condiciones</Link>
          <Link href="/acceso">Pol&iacute;tica de privacidad</Link>
          <Link href="/soporte">Soporte</Link>
        </nav>
        <span className="footer-country">Argentina</span>
      </footer>
    </>
  );
}
