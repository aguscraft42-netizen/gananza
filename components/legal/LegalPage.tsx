import Link from "next/link";
import type { ReactNode } from "react";
import { GananzaLogo } from "@/components/brand/gananza-logo";

type LegalSection = { id: string; title: string; content: ReactNode };

export function LegalPage({ eyebrow, title, intro, updatedAt, sections }: {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return <div className="legal-page">
    <header className="legal-header">
      <div className="legal-shell legal-header-inner">
        <Link href="/" aria-label="Gananza, inicio" className="legal-brand"><GananzaLogo variant="logo-tagline" size={44} priority /></Link>
        <nav aria-label="Navegación pública">
          <Link href="/#como-funciona">Cómo funciona</Link><Link href="/#seguridad">Seguridad</Link><Link href="/soporte">Soporte</Link><Link href="/acceso?mode=login">Ingresar</Link><Link href="/acceso?mode=register" className="legal-header-cta">Empezar a ganar</Link>
        </nav>
      </div>
    </header>
    <main className="legal-shell legal-main">
      <nav className="legal-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span aria-hidden="true">/</span><span>{title}</span></nav>
      <header className="legal-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p><small>Última actualización: {updatedAt}</small></header>
      <div className="legal-layout">
        <aside className="legal-index" aria-label="Contenido de la página"><strong>Contenido</strong><nav>{sections.map((section, index) => <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}</nav></aside>
        <article className="legal-document">
          {sections.map((section, index) => <section id={section.id} key={section.id}><div className="legal-section-number">{String(index + 1).padStart(2, "0")}</div><div><h2>{section.title}</h2>{section.content}</div></section>)}
          <div className="legal-help"><div><strong>¿Necesitás ayuda?</strong><p>Podés comunicarte con Gananza desde el centro de soporte.</p></div><Link href="/soporte">Ir a Soporte</Link></div>
        </article>
      </div>
    </main>
    <footer className="legal-footer">
      <div className="legal-shell legal-footer-grid"><div><Link href="/" aria-label="Gananza, inicio"><GananzaLogo variant="logo-tagline" size={42} /></Link><p>Tareas, recompensas y retiros con información clara en cada etapa.</p></div><nav aria-label="Enlaces legales"><strong>Legal</strong><Link href="/terminos">Términos</Link><Link href="/privacidad">Privacidad</Link><Link href="/soporte">Soporte</Link></nav></div>
      <div className="legal-shell legal-footer-bottom"><span>© {new Date().getFullYear()} Gananza</span><span>Argentina</span></div>
    </footer>
  </div>;
}
