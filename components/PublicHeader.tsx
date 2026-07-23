import Link from "next/link";
import { GananzaLogo } from "@/components/brand/gananza-logo";

export function PublicHeader() {
  return (
    <header className="public-header public-shell">
      <Link href="/" className="brand public-brand" aria-label="Gananza, inicio"><GananzaLogo variant="logo-tagline" size={46} priority /></Link>
      <nav className="public-nav" aria-label="Navegación principal">
        <Link href="#como-funciona">Cómo funciona</Link>
        <Link href="#estados">Estados</Link>
        <Link href="/acceso" className="secondary-button">Ingresar</Link>
        <Link href="/acceso" className="primary-button">Probar Gananza</Link>
      </nav>
    </header>
  );
}
