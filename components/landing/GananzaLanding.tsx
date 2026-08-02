"use client";

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GananzaLogo } from "@/components/brand/gananza-logo";

const LANDING_STEPS = [
  {
    title: "Elegí una tarea",
    description: "Revisá el objetivo, el tiempo estimado, la vigencia y las condiciones.",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 9h7M8.5 13h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  },
  {
    title: "Completá el objetivo",
    description: "Empezá desde Gananza y seguí el progreso sin perder la atribución.",
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="m8.7 12 2.2 2.2 4.7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    title: "Esperá la validación",
    description: "El proveedor confirma que se cumplió correctamente.",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 3.5h10M7 20.5h10M8.2 4c0 4 2.4 5.2 3.8 6.2 1.4-1 3.8-2.2 3.8-6.2M8.2 20c0-4 2.4-5.2 3.8-6.2 1.4 1 3.8 2.2 3.8 6.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    title: "Retirá tu saldo",
    description: "Cuando quede disponible, elegí tu método de retiro.",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 8h14v10H5V8Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 8V6.8A1.8 1.8 0 0 1 9.8 5h4.4A1.8 1.8 0 0 1 16 6.8V8M9 13h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  },
] as const;

const LANDING_STEPS_MARKUP = LANDING_STEPS.map(
  (step, index) => `
    <article class="step-card reveal">
      <div class="step-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="step-icon">${step.icon}</div>
      <h3>${step.title}</h3>
      <p>${step.description}</p>
    </article>`,
).join("");

const LANDING_MARKUP = `
<header class="header" id="header">
  <div class="container header-inner">
    <a class="brand" href="#inicio" aria-label="Gananza, inicio"><span class="brand-logo-slot" data-brand-slot="header"></span></a>
    <nav class="nav" aria-label="Navegación principal">
      <a href="#beneficios">Beneficios</a>
      <a href="#como-funciona">Cómo funciona</a>
      <a href="#estados">Estados</a>
      <a href="#seguridad">Seguridad</a>
    </nav>
    <div class="header-actions">
      <a class="btn secondary" href="/acceso?mode=login">Ingresar</a>
      <a class="btn primary" href="/acceso?mode=register">Empezar a ganar</a>
      <button class="menu-btn" id="menuButton" aria-label="Abrir menú">☰</button>
    </div>
  </div>
</header>

<main>
<section class="hero" id="inicio">
  <div class="container hero-grid">
    <div class="hero-copy reveal">
      <span class="hero-badge">Tareas claras. Recompensas transparentes.</span>
      <div class="hero-kicker">GENERÁ INGRESOS EXTRA</div>
      <h1 class="hero-title">Tu tiempo también puede <span>sumar.</span></h1>
      <p class="hero-sub">Completá tareas, encuestas y desafíos. Conocé la recompensa antes de empezar y retirá tu saldo cuando quede disponible.</p>
      <div class="hero-actions">
        <a class="btn primary" href="/acceso?mode=register">Empezar a ganar</a>
        <a class="btn secondary" href="#como-funciona">Ver cómo funciona</a>
      </div>
      <div class="claims">
        <span class="claim"><i></i>Tareas claras</span>
        <span class="claim"><i></i>Recompensas visibles</span>
        <span class="claim"><i></i>Retiros verificados</span>
      </div>
      <div class="hero-note">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 3 5.5 5.6v5c0 4.2 2.6 8 6.5 9.6 3.9-1.6 6.5-5.4 6.5-9.6v-5L12 3Z" stroke="currentColor" stroke-width="1.8"/><path d="m8.8 11.6 2.1 2.1 4.4-4.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Las recompensas dependen de completar y validar cada tarea. Gananza no garantiza ingresos fijos.</span>
      </div>
    </div>

    <div class="hero-visual reveal">
      <div class="hero-glow"></div>
      <div class="orbit"></div><div class="orbit2"></div><div class="orbit3"></div>
      <div class="coin c1"></div><div class="coin c2"></div><div class="coin c3"></div>

      <div class="phone-wrap" id="phoneWrap">
        <div class="phone-canvas">
          <div class="phone-shell">
            <section class="phone-screen">
              <div class="notch"></div>
              <div class="phone-content">
                <div class="statusbar"><span>9:41</span><span>▮◔▣</span></div>
                <div class="phone-brand"><span class="phone-logo-slot" data-brand-slot="phone"></span></div>
                <div class="greeting">Hola, Agus</div>
                <div class="caption">Tu saldo disponible</div>
                <div class="balance">$ 8.650</div>
                <button class="withdraw">Retirar saldo</button>

                <article class="feature-card">
                  <div class="feature-top">
                    <div><div class="feature-kicker">Tarea recomendada</div><div class="feature-title">Encuesta de opinión</div></div>
                    <div class="reward">+$650</div>
                  </div>
                  <div class="feature-meta"><span class="chip">75 min</span><span class="chip">Validación del proveedor</span></div>
                </article>

                <div class="phone-section-title"><span>Actividad reciente</span><span>Ver todas</span></div>
                <div class="task-list">
                  <div class="task">
                    <div class="task-icon">
                      <svg viewBox="0 0 42 42" fill="none"><rect x="1.5" y="1.5" width="39" height="39" rx="13" fill="url(#khg)"/><path d="M11 27.2V16.8l4.2 2.1 5.8-6.1 5.8 6.1 4.2-2.1v10.4H11Z" fill="rgba(255,255,255,.14)" stroke="white" stroke-width="1.4"/><path d="M18.1 27.2v-4.6c0-.9.7-1.6 1.6-1.6h2.6c.9 0 1.6.7 1.6 1.6v4.6" stroke="white" stroke-width="1.4"/><defs><linearGradient id="khg" x1="6" y1="4" x2="35" y2="38"><stop stop-color="#8456FF"/><stop offset="1" stop-color="#4D2BD1"/></linearGradient></defs></svg>
                    </div>
                    <div><div class="task-name">Kingdom Harbor</div><div class="task-meta">Confirmada</div></div><div class="task-value">+$4.200</div>
                  </div>
                  <div class="task">
                    <div class="task-icon">
                      <svg viewBox="0 0 42 42" fill="none"><rect x="1.5" y="1.5" width="39" height="39" rx="13" fill="url(#hdg)"/><rect x="12.5" y="9.5" width="17" height="23" rx="4.8" fill="rgba(255,255,255,.12)" stroke="white" stroke-width="1.4"/><path d="m17 25 2.2 2.2 5.5-5.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="hdg" x1="7" y1="4" x2="34" y2="38"><stop stop-color="#4DA3FF"/><stop offset="1" stop-color="#2A73D9"/></linearGradient></defs></svg>
                    </div>
                    <div><div class="task-name">Hábitos digitales</div><div class="task-meta">Pendiente</div></div><div class="task-value">+$850</div>
                  </div>
                  <div class="task">
                    <div class="task-icon">
                      <svg viewBox="0 0 42 42" fill="none"><rect x="1.5" y="1.5" width="39" height="39" rx="13" fill="url(#apg)"/><path d="M11 24.2c0-2.5 2-4.5 4.5-4.5h11c2.5 0 4.5 2 4.5 4.5v1.3H11v-1.3Z" fill="rgba(0,0,0,.15)" stroke="#251505" stroke-width="1.4"/><path d="M14 19.8l2.2-3.5h9.5l2.3 3.5" stroke="#251505" stroke-width="1.5"/><circle cx="16.4" cy="25.4" r="2.1" fill="#251505"/><circle cx="25.6" cy="25.4" r="2.1" fill="#251505"/><defs><linearGradient id="apg" x1="7" y1="4" x2="35" y2="38"><stop stop-color="#F3BE43"/><stop offset="1" stop-color="#D39217"/></linearGradient></defs></svg>
                    </div>
                    <div><div class="task-name">Probá AutoPro</div><div class="task-meta">En progreso</div></div><div class="task-value">+$1.800</div>
                  </div>
                </div>
              </div>
              <nav class="phone-nav"><span class="active">Inicio</span><span>Tareas</span><span>Saldo</span><span>Actividad</span><span>Perfil</span></nav>
              <div class="home-indicator"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="beneficios">
  <div class="container">
    <p class="eyebrow reveal">Beneficios</p>
    <h2 class="section-title reveal">Una experiencia clara desde la primera tarea.</h2>
    <p class="section-lead reveal">Gananza combina recompensas visibles, seguimiento y retiros revisados sin esconder el estado real de cada oportunidad.</p>

    <div class="benefits-grid">
      <article class="benefit-card reveal">
        <div class="benefit-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4.5 8.5h15v10h-15v-10Z" stroke="currentColor" stroke-width="1.8"/><path d="M7 8.5V6.8A1.8 1.8 0 0 1 8.8 5h6.4A1.8 1.8 0 0 1 17 6.8v1.7M8 13h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>
        <h3>Ingresos extra</h3>
        <p>Completá tareas y sumá recompensas según tu actividad.</p>
        <div class="mini-ui"><div class="mini-row"><strong>Saldo generado</strong><span>+$4.200</span></div><div class="mini-meta"><i>Tarea confirmada</i><i>Disponible</i></div></div>
      </article>

      <article class="benefit-card reveal">
        <div class="benefit-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3.5" width="14" height="17" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 8h7M8.5 11.5h4.5M8.5 15h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>
        <h3>Todo claro desde el inicio</h3>
        <p>Sabés qué hacer, cuánto suma y cuándo puede validarse.</p>
        <div class="mini-ui"><div class="mini-row"><strong>Encuesta recomendada</strong><span>+$650</span></div><div class="mini-meta"><i>75 min</i><i>Validación del proveedor</i></div></div>
      </article>

      <article class="benefit-card reveal" id="seguridad">
        <div class="benefit-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 5.5 5.6v5c0 4.2 2.6 8 6.5 9.6 3.9-1.6 6.5-5.4 6.5-9.6v-5L12 3Z" stroke="currentColor" stroke-width="1.8"/><path d="m8.8 11.6 2.1 2.1 4.4-4.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <h3>Retiro seguro</h3>
        <p>Solicitá tu saldo disponible mediante métodos verificados.</p>
        <div class="mini-ui"><div class="mini-row"><strong>Método guardado</strong><span>Verificado</span></div><div class="mini-meta"><i>Mercado Pago</i><i>Revisión previa</i></div></div>
      </article>
    </div>
  </div>
</section>

<section class="section" id="como-funciona">
  <div class="container">
    <p class="eyebrow reveal">Cómo funciona</p>
    <h2 class="section-title reveal">Cuatro pasos para convertir una tarea en saldo disponible.</h2>
    <div class="steps-wrap">
      <div class="steps-line"></div>
      <div class="steps-grid">${LANDING_STEPS_MARKUP}</div>
    </div>
  </div>
</section>

<section class="section" id="estados">
  <div class="container">
    <p class="eyebrow reveal">Estados de recompensa</p>
    <h2 class="section-title reveal">Cada tarea muestra su estado real.</h2>
    <p class="section-lead reveal">Gananza separa lo disponible, lo pendiente y lo confirmado para que entiendas qué está ocurriendo con cada recompensa.</p>

    <div class="states-layout">
      <article class="main-state reveal">
        <div class="main-state-icon"><svg viewBox="0 0 64 64" fill="none"><path d="M32 5 11 13v16c0 13.6 8.5 25.8 21 31 12.5-5.2 21-17.4 21-31V13L32 5Z" stroke="#23e18b" stroke-width="4"/><path d="m22 32 7 7 14-16" stroke="#23e18b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <div class="main-state-copy"><h3>Seguimiento visible</h3><p>El saldo disponible, las validaciones pendientes y las tareas confirmadas aparecen separados para que siempre sepas qué podés retirar.</p></div>
        <div class="state-pills"><span>Disponible para retirar</span><span>Revisión por proveedor</span></div>
      </article>

      <div class="states-grid">
        <article class="state-card available reveal"><div class="state-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M14 4.5c2.9 1.1 4.7 3.4 5.5 6.8l-4.3 4.3-3-3-3.8 1.2 1.2-3.8-3-3L11 2.7c1 .2 2 .8 3 1.8Z" stroke="currentColor" stroke-width="1.8"/></svg></div><div><h3>Disponible</h3><p>Podés iniciarla ahora.</p></div></article>
        <article class="state-card progress reveal"><div class="state-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3.7a8.3 8.3 0 1 1-6.1 2.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5.8 3.5v4.8h4.8" stroke="currentColor" stroke-width="2"/></svg></div><div><h3>En progreso</h3><p>Seguimiento activo.</p></div></article>
        <article class="state-card pending reveal"><div class="state-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M7 3.5h10M7 20.5h10M8.2 4c0 4 2.4 5.2 3.8 6.2 1.4-1 3.8-2.2 3.8-6.2M8.2 20c0-4 2.4-5.2 3.8-6.2 1.4 1 3.8 2.2 3.8 6.2" stroke="currentColor" stroke-width="1.8"/></svg></div><div><h3>Pendiente</h3><p>El proveedor está validando.</p></div></article>
        <article class="state-card confirmed reveal"><div class="state-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 5.5 5.6v5c0 4.2 2.6 8 6.5 9.6 3.9-1.6 6.5-5.4 6.5-9.6v-5L12 3Z" stroke="currentColor" stroke-width="1.8"/><path d="m8.8 11.6 2.1 2.1 4.4-4.7" stroke="currentColor" stroke-width="1.8"/></svg></div><div><h3>Confirmada</h3><p>Ya forma parte del saldo.</p></div></article>
        <article class="state-card rejected reveal"><div class="state-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.8"/></svg></div><div><h3>Rechazada</h3><p>Se informa el motivo.</p></div></article>
        <article class="state-card finished reveal"><div class="state-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 20V4m0 1h9.4l-1.6 3 1.6 3H6" stroke="currentColor" stroke-width="1.8"/></svg></div><div><h3>Finalizada</h3><p>La oportunidad terminó.</p></div></article>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta reveal">
      <div class="cta-copy">
        <p class="eyebrow">Gananza</p>
        <h2>Empezá a generar ingresos extra con Gananza.</h2>
        <p>Encontrá tareas, conocé la recompensa antes de empezar y seguí cada estado hasta que tu saldo esté disponible.</p>
        <div class="cta-actions">
          <a class="btn primary" href="/acceso?mode=register">Crear mi cuenta</a>
          <a class="btn secondary" href="#como-funciona">Explorar cómo funciona</a>
        </div>
        <div class="cta-note"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 5.5 5.6v5c0 4.2 2.6 8 6.5 9.6 3.9-1.6 6.5-5.4 6.5-9.6v-5L12 3Z" stroke="currentColor" stroke-width="1.8"/><path d="m8.8 11.6 2.1 2.1 4.4-4.7" stroke="currentColor" stroke-width="1.8"/></svg><span>Registrarte no tiene costo. Las tareas disponibles pueden variar según tu perfil y ubicación.</span></div>
      </div>
      <div class="wallet-visual" aria-hidden="true">
        <div class="wallet-card"><strong>Gananza</strong><div class="wallet-label">Saldo disponible</div><div class="wallet-balance">$ 8.650</div></div>
        <div class="graph">
          <span class="graph-bar gb1"></span><span class="graph-bar gb2"></span><span class="graph-bar gb3"></span><span class="graph-bar gb4"></span>
          <svg viewBox="0 0 280 220" fill="none"><path class="graph-path" d="M15 176 C55 161,72 162,96 134 S142 101,165 116 S205 70,248 38" stroke="#23e18b" stroke-width="5" stroke-linecap="round"/><path d="m239 40 12-5-3 12" stroke="#23e18b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div>
  </div>
</section>
</main>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="#inicio" aria-label="Gananza, inicio"><span class="brand-logo-slot" data-brand-slot="footer"></span></a>
        <p>Una plataforma para descubrir tareas, seguir recompensas y retirar saldo disponible con información clara en cada etapa.</p>
      </div>
      <div class="footer-links"><strong>Producto</strong><a href="#beneficios">Beneficios</a><a href="#como-funciona">Cómo funciona</a><a href="#estados">Estados</a></div>
      <div class="footer-links"><strong>Legal</strong><a href="#">Términos</a><a href="#">Privacidad</a><a href="/soporte">Soporte</a></div>
    </div>
    <div class="footer-bottom"><span>© <span id="year"></span> Gananza</span><span>Argentina · Experiencia visual de integración</span></div>
  </div>
</footer>
`;

const LANDING_STYLES = `
.gananza-root{display:block;min-height:100vh;overflow-x:hidden;color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 8% 10%,rgba(35,225,139,.08),transparent 28%),radial-gradient(circle at 88% 24%,rgba(60,170,255,.05),transparent 25%),linear-gradient(180deg,#06101a 0%,#040a11 100%)}

.gananza-root{
  --bg:#050c15;
  --bg-2:#07111d;
  --panel:#0a1724;
  --panel-2:#0d1d2c;
  --text:#f5f8fb;
  --muted:#98a9b9;
  --green:#23e18b;
  --green-2:#0dbb70;
  --gold:#f2bd38;
  --blue:#3caaff;
  --yellow:#f4bc31;
  --red:#ff5d72;
  --violet:#9a7df5;
  --line:rgba(255,255,255,.08);
  --soft-line:rgba(255,255,255,.05);
  --header-h:76px;
  --radius-xl:34px;
  --radius-lg:26px;
  --radius-md:18px;
  --shadow:0 26px 70px rgba(0,0,0,.34);
}
.gananza-root,.gananza-root *{box-sizing:border-box}
.gananza-root{scroll-behavior:smooth;background:var(--bg)}
.gananza-root{
  margin:0;
  min-height:100vh;
  color:var(--text);
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  background:
    radial-gradient(circle at 8% 10%,rgba(35,225,139,.08),transparent 28%),
    radial-gradient(circle at 88% 24%,rgba(60,170,255,.05),transparent 25%),
    linear-gradient(180deg,#06101a 0%,#040a11 100%);
  overflow-x:hidden;
}
.gananza-root a{text-decoration:none;color:inherit}
.gananza-root button{font:inherit}
.gananza-root .container{width:min(1240px,calc(100% - 40px));margin:0 auto}
.gananza-root .section{padding:92px 0}
.gananza-root .eyebrow{
  margin:0 0 14px;
  color:var(--green);
  font-size:13px;
  font-weight:850;
  letter-spacing:.14em;
  text-transform:uppercase;
}
.gananza-root .section-title{
  margin:0;
  max-width:820px;
  font-size:clamp(40px,5vw,72px);
  line-height:.98;
  letter-spacing:-.045em;
}
.gananza-root .section-lead{
  max-width:720px;
  margin:22px 0 0;
  color:var(--muted);
  font-size:18px;
  line-height:1.65;
}

/* Header */
.gananza-root .header{
  position:sticky;
  top:0;
  z-index:100;
  height:var(--header-h);
  display:flex;
  align-items:center;
  border-bottom:1px solid rgba(255,255,255,.06);
  background:rgba(4,11,19,.72);
  backdrop-filter:blur(18px);
  transition:height .25s ease,background .25s ease;
}
.gananza-root .header.compact{height:66px;background:rgba(4,11,19,.90)}
.gananza-root .header-inner{display:flex;align-items:center;justify-content:space-between;gap:24px}
.gananza-root .brand{width:auto;min-height:0;padding:0;display:flex;align-items:center}
.gananza-root .brand-logo-slot{display:inline-flex;min-width:164px;min-height:42px;align-items:center}
.gananza-root .brand-logo-slot .gananza-brand{flex:none}
.gananza-root .nav{display:flex;align-items:center;gap:28px}
.gananza-root .nav a{font-size:14px;font-weight:650;color:#d8e3ec;opacity:.86}
.gananza-root .nav a:hover{opacity:1}
.gananza-root .header-actions{display:flex;gap:10px}
.gananza-root .btn{
  border:0;
  border-radius:15px;
  padding:14px 20px;
  font-weight:850;
  cursor:pointer;
  transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;
}
.gananza-root .btn:hover{transform:translateY(-2px)}
.gananza-root .btn.primary{
  color:#03150e;
  background:linear-gradient(135deg,var(--green),#18cb78);
  box-shadow:0 14px 34px rgba(35,225,139,.22);
}
.gananza-root .btn.primary:hover{box-shadow:0 20px 42px rgba(35,225,139,.28)}
.gananza-root .btn.secondary{
  color:#eef5fa;
  background:rgba(9,20,32,.78);
  border:1px solid rgba(255,255,255,.10);
}
.gananza-root .menu-btn{
  display:none;
  width:44px;height:44px;border-radius:13px;
  border:1px solid rgba(255,255,255,.10);
  color:#f2f6fa;background:rgba(9,20,32,.78);
}

/* Hero */
.gananza-root .hero{
  position:relative;
  min-height:calc(100svh - var(--header-h));
  display:grid;
  align-items:center;
  padding:54px 0 72px;
}
.gananza-root .hero:before{
  content:"";
  position:absolute;inset:0;
  background:
    radial-gradient(circle at 72% 44%,rgba(35,225,139,.13),transparent 28%),
    repeating-linear-gradient(90deg,transparent 0 47px,rgba(255,255,255,.012) 47px 48px);
  pointer-events:none;
}
.gananza-root .hero-grid{
  position:relative;z-index:2;
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(430px,.95fr);
  gap:28px;
  align-items:center;
}
.gananza-root .hero-copy{max-width:650px}
.gananza-root .hero-badge{
  display:inline-flex;align-items:center;gap:10px;
  padding:10px 15px;border-radius:999px;
  color:var(--green);
  background:rgba(11,29,34,.54);
  border:1px solid rgba(35,225,139,.20);
  font-size:12px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;
}
.gananza-root .hero-kicker{
  margin:22px 0 8px;
  color:var(--green);
  font-size:clamp(38px,4.4vw,68px);
  font-weight:950;
  line-height:.98;
  letter-spacing:-.035em;
}
.gananza-root .hero-title{
  margin:0;
  font-size:clamp(58px,7.3vw,104px);
  line-height:.90;
  letter-spacing:-.055em;
}
.gananza-root .hero-title span{color:var(--green)}
.gananza-root .hero-sub{
  max-width:620px;
  margin:26px 0 0;
  color:#d5dfe8;
  font-size:clamp(18px,1.8vw,25px);
  line-height:1.5;
}
.gananza-root .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:30px}
.gananza-root .hero-actions .btn{padding:17px 26px;font-size:16px}
.gananza-root .claims{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
.gananza-root .claim{
  display:inline-flex;align-items:center;gap:9px;
  padding:11px 14px;border-radius:999px;
  background:rgba(9,23,37,.72);
  border:1px solid rgba(255,255,255,.08);
  color:#dce6ee;font-size:13px;font-weight:700;
}
.gananza-root .claim i{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 14px rgba(35,225,139,.72)}
.gananza-root .hero-note{
  display:flex;gap:10px;align-items:flex-start;
  margin-top:18px;max-width:620px;
  color:var(--muted);font-size:13px;line-height:1.55;
}
.gananza-root .hero-note svg{width:21px;height:21px;flex:0 0 21px;color:var(--green)}
.gananza-root .hero-visual{
  position:relative;
  min-height:710px;
  display:grid;
  place-items:center;
}
.gananza-root .hero-glow{
  position:absolute;
  width:620px;height:620px;border-radius:50%;
  background:radial-gradient(circle,rgba(35,225,139,.18),rgba(35,225,139,.06) 42%,transparent 70%);
  filter:blur(4px);
  animation:breathe 6s ease-in-out infinite;
}
.gananza-root .orbit,.gananza-root .orbit2,.gananza-root .orbit3{position:absolute;border-radius:50%;border:1px solid rgba(35,225,139,.15)}
.gananza-root .orbit{width:680px;height:680px;transform:rotate(-9deg);animation:spin 36s linear infinite}
.gananza-root .orbit2{width:520px;height:520px;border-style:dashed;opacity:.5;animation:spinReverse 42s linear infinite}
.gananza-root .orbit3{width:410px;height:410px;opacity:.3}
.gananza-root .coin{
  position:absolute;z-index:4;
  display:grid;place-items:center;
  border-radius:50%;
  color:#edfff6;font-weight:950;
  background:radial-gradient(circle at 32% 28%,#71f3ba,#23c97c 60%,#08724a);
  border:4px solid rgba(242,189,56,.84);
  box-shadow:0 12px 28px rgba(0,0,0,.34),0 0 28px rgba(35,225,139,.24);
  animation:coinFloat 5.8s ease-in-out infinite;
}
.gananza-root .coin:before{content:"$"}
.gananza-root .coin.c1{width:74px;height:74px;right:20px;top:120px}
.gananza-root .coin.c2{width:56px;height:56px;left:5px;top:320px;animation-delay:.7s}
.gananza-root .coin.c3{width:46px;height:46px;right:50px;bottom:110px;animation-delay:1.2s}

/* phone */
.gananza-root .phone-wrap{
  position:relative;
  width:min(390px,84vw);
  aspect-ratio:390/844;
  transform:rotate(6deg);
  z-index:3;
  filter:drop-shadow(0 42px 80px rgba(0,0,0,.62)) drop-shadow(0 0 36px rgba(35,225,139,.14));
  animation:phoneFloat 6s ease-in-out infinite;
}
.gananza-root .phone-canvas{
  position:absolute;inset:0 auto auto 0;
  width:390px;height:844px;
  transform-origin:top left;
  transform:scale(var(--phone-scale,1));
}
.gananza-root .phone-shell{
  position:absolute;inset:0;
  border-radius:54px;padding:10px;
  background:linear-gradient(135deg,#d7e1e8 0%,#15212b 18%,#05080c 52%,#52606a 82%,#0b1218 100%);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),inset 0 0 0 3px rgba(3,8,12,.85),0 0 0 1px rgba(255,255,255,.06);
}
.gananza-root .phone-shell:after{
  content:"";position:absolute;right:-4px;top:150px;
  width:5px;height:92px;border-radius:8px;
  background:linear-gradient(180deg,#59646c,#0e151b);
  box-shadow:0 116px 0 #1b252d;
}
.gananza-root .phone-screen{
  height:100%;border-radius:45px;overflow:hidden;
  display:flex;flex-direction:column;
  position:relative;padding:34px 22px 20px;
  background:radial-gradient(circle at 80% 0%,rgba(35,225,139,.08),transparent 34%),linear-gradient(180deg,#091724 0%,#07111a 64%,#050a0f 100%);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);
}
.gananza-root .notch{
  position:absolute;top:13px;left:50%;transform:translateX(-50%);
  width:114px;height:30px;border-radius:19px;background:#03070a;
}
.gananza-root .phone-content{flex:1;min-height:0;overflow:hidden;padding-bottom:96px}
.gananza-root .statusbar{display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#d9e3ea;margin-bottom:24px}
.gananza-root .phone-brand{display:flex;align-items:center;margin-bottom:26px}
.gananza-root .phone-logo-slot{display:inline-flex;min-width:130px;min-height:34px;align-items:center}
.gananza-root .greeting{font-size:16px;font-weight:700;margin-bottom:4px}
.gananza-root .caption{color:var(--muted);font-size:11px}
.gananza-root .balance{font-size:44px;line-height:1;font-weight:850;letter-spacing:-.04em;margin:8px 0 14px}
.gananza-root .withdraw{
  width:100%;border:0;border-radius:16px;padding:14px 18px;
  background:linear-gradient(180deg,#1fe58a,#0fb96e);
  color:#04150d;font-weight:900;font-size:15px;
  box-shadow:0 14px 28px rgba(0,185,109,.22)
}
.gananza-root .feature-card{
  margin-top:18px;padding:15px;border-radius:18px;
  background:linear-gradient(180deg,rgba(18,38,53,.98),rgba(11,24,35,.98));
  border:1px solid rgba(94,127,148,.22);
  box-shadow:0 16px 34px rgba(0,0,0,.28)
}
.gananza-root .feature-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.gananza-root .feature-kicker{font-size:9px;color:#7f94a5;text-transform:uppercase;letter-spacing:.09em}
.gananza-root .feature-title{font-weight:800;font-size:15px;margin-top:4px}
.gananza-root .reward{color:var(--green);font-size:18px;font-weight:900;white-space:nowrap}
.gananza-root .feature-meta{display:flex;gap:8px;margin-top:11px}
.gananza-root .chip{font-size:9px;color:#a9b8c4;padding:5px 7px;border-radius:999px;background:#132735;border:1px solid rgba(255,255,255,.05)}
.gananza-root .phone-section-title{display:flex;align-items:center;justify-content:space-between;margin:22px 0 10px;font-size:12px;font-weight:800}
.gananza-root .phone-section-title span:last-child{color:#7f94a5;font-size:10px;font-weight:600}
.gananza-root .task-list{display:grid;gap:9px}
.gananza-root .task{
  display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;
  padding:10px 11px;border-radius:15px;
  background:linear-gradient(180deg,#0e1c29,#0a1722);
  border:1px solid rgba(255,255,255,.05)
}
.gananza-root .task-icon{
  width:42px;height:42px;border-radius:14px;
  display:grid;place-items:center;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 10px 18px rgba(0,0,0,.22)
}
.gananza-root .task-icon svg{width:42px;height:42px}
.gananza-root .task-name{font-size:11px;font-weight:800}
.gananza-root .task-meta{font-size:9px;color:#8396a5;margin-top:2px}
.gananza-root .task-value{font-size:11px;color:var(--green);font-weight:900}
.gananza-root .phone-nav{
  position:absolute;left:18px;right:18px;bottom:24px;height:68px;z-index:20;
  display:grid;grid-template-columns:repeat(5,minmax(0,1fr));align-items:center;
  padding:8px 6px;border-radius:20px;
  background:rgba(6,14,20,.94);border:1px solid rgba(255,255,255,.07);
  box-shadow:0 12px 28px rgba(0,0,0,.34);backdrop-filter:blur(14px)
}
.gananza-root .phone-nav span{text-align:center;color:#6f8290;font-size:10px;font-weight:600}
.gananza-root .phone-nav span.active{color:var(--green)}
.gananza-root .home-indicator{
  position:absolute;left:50%;bottom:8px;width:76px;height:4px;
  transform:translateX(-50%);border-radius:999px;background:rgba(220,229,234,.78);z-index:21
}

/* Benefits */
.gananza-root .benefits-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:16px;
  margin-top:40px;
}
.gananza-root .benefit-card{
  min-height:310px;
  padding:26px;
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:0;
  border-radius:26px;
  background:linear-gradient(180deg,rgba(13,29,44,.96),rgba(7,17,27,.98));
  border:1px solid var(--line);
  box-shadow:var(--shadow);
  transition:transform .25s ease,border-color .25s ease;
}
.gananza-root .benefit-card:hover{transform:translateY(-5px);border-color:rgba(35,225,139,.24)}
.gananza-root .benefit-icon{
  width:62px;height:62px;border-radius:18px;
  display:grid;place-items:center;
  color:var(--green);
  background:rgba(35,225,139,.08);
  border:1px solid rgba(35,225,139,.18);
  box-shadow:0 0 28px rgba(35,225,139,.08)
}
.gananza-root .benefit-icon svg{width:31px;height:31px}
.gananza-root .benefit-card h3{margin:24px 0 10px;font-size:25px}
.gananza-root .benefit-card p{margin:0 0 22px;color:var(--muted);line-height:1.6}
.gananza-root .mini-ui{
  width:100%;
  margin-top:auto;
  padding:16px;
  border-radius:18px;
  background:#081521;
  border:1px solid rgba(255,255,255,.06)
}
.gananza-root .mini-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.gananza-root .mini-row strong{font-size:14px}.gananza-root .mini-row span{color:var(--green);font-weight:850}
.gananza-root .mini-meta{display:flex;gap:8px;margin-top:10px}
.gananza-root .mini-meta i{
  font-style:normal;font-size:11px;color:#a9b7c5;padding:6px 8px;border-radius:999px;
  background:#102333;border:1px solid rgba(255,255,255,.05)
}

/* How */
.gananza-root .steps-wrap{position:relative;margin-top:46px}
.gananza-root .steps-line{
  position:absolute;left:7%;right:7%;top:44px;height:2px;
  background:linear-gradient(90deg,rgba(35,225,139,.18),rgba(35,225,139,.65),rgba(35,225,139,.18));
  transform-origin:left;
  animation:growLine 1.2s ease forwards
}
.gananza-root .steps-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;position:relative}
.gananza-root .step-card{
  min-height:290px;
  padding:24px;
  border-radius:24px;
  background:linear-gradient(180deg,rgba(13,29,44,.96),rgba(7,17,27,.98));
  border:1px solid var(--line);
  box-shadow:var(--shadow)
}
.gananza-root .step-number{
  position:relative;top:auto;left:auto;
  width:54px;height:54px;border-radius:17px;
  min-width:54px;margin-bottom:0;flex:none;
  display:grid;place-items:center;
  color:#03150e;background:linear-gradient(135deg,var(--green),#18c977);
  font-size:16px;font-weight:950;box-shadow:0 12px 26px rgba(35,225,139,.18)
}
.gananza-root .step-icon{margin-top:30px;color:var(--green)}
.gananza-root .step-icon svg{width:34px;height:34px}
.gananza-root .step-card h3{margin:16px 0 10px;font-size:22px}
.gananza-root .step-card p{margin:0;color:var(--muted);line-height:1.58}

/* States */
.gananza-root .states-layout{
  display:grid;
  grid-template-columns:minmax(0,1.1fr) minmax(0,1.4fr);
  gap:18px;
  align-items:stretch;
  margin-top:42px;
}
.gananza-root .main-state,.gananza-root .state-card{
  position:relative;overflow:hidden;
  border:1px solid var(--line);
  background:linear-gradient(180deg,rgba(13,27,41,.96),rgba(7,16,25,.98));
  box-shadow:var(--shadow)
}
.gananza-root .main-state{
  min-height:424px;border-radius:28px;padding:34px;
  display:flex;flex-direction:column;justify-content:space-between
}
.gananza-root .main-state:before{
  content:"";position:absolute;width:310px;height:310px;top:-110px;right:-90px;border-radius:50%;
  background:radial-gradient(circle,rgba(35,225,139,.16),transparent 67%)
}
.gananza-root .main-state-icon{
  width:126px;height:126px;border-radius:34px;display:grid;place-items:center;
  background:linear-gradient(145deg,rgba(35,225,139,.14),rgba(35,225,139,.03));
  border:1px solid rgba(35,225,139,.22)
}
.gananza-root .main-state-icon svg{width:72px;height:72px}
.gananza-root .main-state-copy{position:relative;z-index:2}
.gananza-root .main-state-copy h3{margin:0 0 12px;font-size:30px}
.gananza-root .main-state-copy p{margin:0;color:var(--muted);line-height:1.6}
.gananza-root .state-pills{display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:2}
.gananza-root .state-pills span{
  padding:10px 13px;border-radius:999px;background:#07121e;
  border:1px solid rgba(255,255,255,.07);font-size:12px
}
.gananza-root .states-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.gananza-root .state-card{
  min-height:205px;border-radius:22px;padding:20px;
  display:flex;flex-direction:column;justify-content:space-between;
  transition:transform .25s ease
}
.gananza-root .state-card:hover{transform:translateY(-4px)}
.gananza-root .state-icon{
  width:54px;height:54px;border-radius:16px;display:grid;place-items:center;
  color:var(--state);background:color-mix(in srgb,var(--state) 9%,rgba(6,14,22,.96));
  border:1px solid color-mix(in srgb,var(--state) 28%,transparent)
}
.gananza-root .state-icon svg{width:28px;height:28px}
.gananza-root .state-card h3{margin:0 0 8px;font-size:19px}
.gananza-root .state-card p{margin:0;color:var(--muted);font-size:14px}
.gananza-root .available{--state:var(--green)}.gananza-root .progress{--state:var(--blue)}.gananza-root .pending{--state:var(--yellow)}.gananza-root .confirmed{--state:var(--green)}.gananza-root .rejected{--state:var(--red)}.gananza-root .finished{--state:var(--violet)}

/* CTA */
.gananza-root .cta{
  position:relative;
  min-height:470px;
  display:grid;
  grid-template-columns:minmax(0,1.1fr) minmax(420px,.9fr);
  align-items:center;
  gap:34px;
  overflow:hidden;
  border-radius:34px;
  padding:58px 62px;
  background:radial-gradient(circle at 72% 34%,rgba(35,225,139,.16),transparent 30%),linear-gradient(135deg,rgba(17,38,57,.98),rgba(8,20,31,.98) 56%,rgba(5,14,23,.98));
  border:1px solid rgba(62,221,153,.18);
  box-shadow:var(--shadow)
}
.gananza-root .cta-copy{position:relative;z-index:2}
.gananza-root .cta h2{margin:0;font-size:clamp(42px,5vw,72px);line-height:.98;letter-spacing:-.045em}
.gananza-root .cta p{max-width:600px;margin:22px 0 0;color:#c7d2dd;font-size:18px;line-height:1.6}
.gananza-root .cta-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:28px}
.gananza-root .cta-note{display:flex;gap:10px;margin-top:20px;color:var(--muted);font-size:13px;line-height:1.5}
.gananza-root .cta-note svg{width:21px;height:21px;flex:0 0 21px;color:var(--green)}
.gananza-root .wallet-visual{position:relative;min-height:330px}
.gananza-root .wallet-card{
  position:absolute;left:10px;bottom:46px;width:250px;height:164px;border-radius:28px;padding:24px;
  background:radial-gradient(circle at 82% 20%,rgba(35,225,139,.16),transparent 28%),linear-gradient(145deg,#12324c,#081826 72%);
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 28px 56px rgba(0,0,0,.38)
}
.gananza-root .wallet-card strong{font-size:18px}.gananza-root .wallet-label{margin-top:24px;color:#9aacbc;font-size:12px}.gananza-root .wallet-balance{font-size:32px;font-weight:900;margin-top:4px}
.gananza-root .graph{
  position:absolute;right:0;top:24px;width:280px;height:220px;
}
.gananza-root .graph svg{width:100%;height:100%;overflow:visible}
.gananza-root .graph-path{stroke-dasharray:420;stroke-dashoffset:420;animation:drawLine 2.2s ease .35s forwards}
.gananza-root .graph-bar{
  position:absolute;bottom:26px;width:24px;border-radius:8px 8px 3px 3px;
  background:linear-gradient(180deg,#38ee99,#0c8c55);transform-origin:bottom;
  animation:barGrow .8s ease forwards
}
.gananza-root .gb1{right:150px;height:45px}.gananza-root .gb2{right:112px;height:78px}.gananza-root .gb3{right:74px;height:118px}.gananza-root .gb4{right:36px;height:158px}

/* Footer */
.gananza-root .footer{padding:34px 0 42px;border-top:1px solid rgba(255,255,255,.06)}
.gananza-root .footer-grid{display:grid;grid-template-columns:1.3fr .7fr .7fr;gap:28px}
.gananza-root .footer p{color:var(--muted);line-height:1.6;max-width:430px}
.gananza-root .footer-links{display:grid;gap:10px}
.gananza-root .footer-links strong{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#dce7ef}
.gananza-root .footer-links a{color:var(--muted);font-size:14px}
.gananza-root .footer-bottom{
  display:flex;justify-content:space-between;gap:18px;
  margin-top:28px;padding-top:22px;border-top:1px solid rgba(255,255,255,.05);
  color:#778899;font-size:12px
}

/* reveal */
.gananza-root .reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}
.gananza-root .reveal.visible{opacity:1;transform:none}

/* anim */
@keyframes phoneFloat{0%,100%{transform:rotate(6deg) translateY(0)}50%{transform:rotate(6deg) translateY(-6px)}}
@keyframes coinFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-10px) rotate(8deg)}}
@keyframes breathe{0%,100%{opacity:.84;transform:scale(.97)}50%{opacity:1;transform:scale(1.04)}}
@keyframes spin{to{transform:rotate(351deg)}}@keyframes spinReverse{to{transform:rotate(-360deg)}}
@keyframes growLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes drawLine{to{stroke-dashoffset:0}}@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}

/* Responsive */
@media(max-width:1080px){
  .gananza-root .nav{display:none}.gananza-root .menu-btn{display:block}.gananza-root .header-actions .secondary{display:none}
  .gananza-root .hero-grid{grid-template-columns:1fr}.gananza-root .hero-copy{max-width:none}.gananza-root .hero-visual{min-height:680px}
  .gananza-root .benefits-grid{grid-template-columns:1fr}
  .gananza-root .steps-grid{grid-template-columns:repeat(2,1fr)}.gananza-root .steps-line{display:none}
  .gananza-root .states-layout{grid-template-columns:1fr}
  .gananza-root .cta{grid-template-columns:1fr;padding:48px 42px}
  .gananza-root .footer-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:720px){
  .gananza-root{--header-h:68px}
  .gananza-root .container{width:min(100% - 28px,1240px)}
  .gananza-root .section{padding:68px 0}
  .gananza-root .header-actions .primary{display:none}
  .gananza-root .brand-copy span{display:none}
  .gananza-root .hero{padding:34px 0 56px}
  .gananza-root .hero-title{font-size:56px}
  .gananza-root .hero-kicker{font-size:36px}
  .gananza-root .hero-sub{font-size:18px}
  .gananza-root .hero-actions{flex-direction:column}.gananza-root .hero-actions .btn{width:100%}
  .gananza-root .claims{flex-direction:column;align-items:flex-start}
  .gananza-root .hero-visual{min-height:600px}
  .gananza-root .phone-wrap{width:min(78vw,340px)}
  .gananza-root .orbit{width:470px;height:470px}.gananza-root .orbit2{width:360px;height:360px}.gananza-root .orbit3{width:285px;height:285px}
  .gananza-root .coin.c1{right:2px}.gananza-root .coin.c2{left:-8px}.gananza-root .coin.c3{right:18px}
  .gananza-root .steps-grid{grid-template-columns:1fr}
  .gananza-root .states-grid{grid-template-columns:repeat(2,1fr)}
  .gananza-root .cta{padding:34px 22px;border-radius:26px}
  .gananza-root .cta-actions{flex-direction:column}.gananza-root .cta-actions .btn{width:100%}
  .gananza-root .wallet-visual{min-height:300px}
  .gananza-root .wallet-card{width:210px;height:142px;padding:20px}
  .gananza-root .graph{width:215px;height:185px}
  .gananza-root .footer-grid{grid-template-columns:1fr}
  .gananza-root .footer-bottom{flex-direction:column}
}
@media(max-width:460px){
  .gananza-root .states-grid{grid-template-columns:1fr}
  .gananza-root .hero-title{font-size:50px}
  .gananza-root .hero-kicker{font-size:32px}
  .gananza-root .main-state{min-height:360px}
}
@media(prefers-reduced-motion:reduce){
  .gananza-root,.gananza-root *{animation:none!important;transition:none!important}
  .gananza-root{scroll-behavior:auto}
  .gananza-root .reveal{opacity:1;transform:none}
  .gananza-root .graph-path{stroke-dashoffset:0}
  .gananza-root .graph-bar{transform:scaleY(1)}
}

@media(max-width:1080px){.gananza-root .nav.mobile-open{position:absolute;display:flex;top:calc(var(--header-h) - 2px);left:14px;right:14px;flex-direction:column;align-items:stretch;gap:0;padding:12px;border-radius:18px;background:rgba(5,14,23,.98);border:1px solid rgba(255,255,255,.08);box-shadow:0 22px 52px rgba(0,0,0,.38)}.gananza-root .nav.mobile-open a{padding:13px 12px;border-radius:11px}.gananza-root .nav.mobile-open a:hover{background:rgba(255,255,255,.04)}}

`;

export default function GananzaLanding() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const headerLogoTarget = root.querySelector('[data-brand-slot="header"]');
    const phoneLogoTarget = root.querySelector('[data-brand-slot="phone"]');
    const footerLogoTarget = root.querySelector('[data-brand-slot="footer"]');
    const headerLogoRoot = headerLogoTarget ? createRoot(headerLogoTarget) : null;
    const phoneLogoRoot = phoneLogoTarget ? createRoot(phoneLogoTarget) : null;
    const footerLogoRoot = footerLogoTarget ? createRoot(footerLogoTarget) : null;

    headerLogoRoot?.render(<GananzaLogo variant="logo-tagline" theme="auto" size={42} priority />);
    phoneLogoRoot?.render(<GananzaLogo variant="logo" theme="auto" size={34} priority />);
    footerLogoRoot?.render(<GananzaLogo variant="logo-tagline" theme="auto" size={42} />);

    const phoneWrap = root.querySelector<HTMLElement>("#phoneWrap");
    const syncPhone = () => {
      if (!phoneWrap) return;
      phoneWrap.style.setProperty(
        "--phone-scale",
        String(phoneWrap.getBoundingClientRect().width / 390),
      );
    };

    syncPhone();
    const resizeObserver =
      phoneWrap && "ResizeObserver" in window
        ? new ResizeObserver(syncPhone)
        : null;
    if (phoneWrap && resizeObserver) resizeObserver.observe(phoneWrap);

    const header = root.querySelector<HTMLElement>("#header");
    const onScroll = () => header?.classList.toggle("compact", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const revealElements = Array.from(root.querySelectorAll(".reveal")) as HTMLElement[];
    let intersectionObserver: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add("visible");
              intersectionObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 },
      );
      revealElements.forEach((element) => intersectionObserver?.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("visible"));
    }

    const year = root.querySelector<HTMLElement>("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    const menuButton = root.querySelector<HTMLButtonElement>("#menuButton");
    const nav = root.querySelector<HTMLElement>(".nav");
    const toggleMenu = () => nav?.classList.toggle("mobile-open");
    menuButton?.addEventListener("click", toggleMenu);

    const closeMenu = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a")) nav?.classList.remove("mobile-open");
    };
    nav?.addEventListener("click", closeMenu);

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      menuButton?.removeEventListener("click", toggleMenu);
      nav?.removeEventListener("click", closeMenu);
      headerLogoRoot?.unmount();
      phoneLogoRoot?.unmount();
      footerLogoRoot?.unmount();
    };
  }, []);

  return (
    <div ref={rootRef} className="gananza-root">
      <style dangerouslySetInnerHTML={{ __html: LANDING_STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_MARKUP }} />
    </div>
  );
}
