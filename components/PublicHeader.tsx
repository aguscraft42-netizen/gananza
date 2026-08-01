import Link from "next/link";
import { GananzaLogo } from "@/components/brand/gananza-logo";

export function PublicHeader() {
  return (
    <header className="launch-header">
      <div className="public-shell launch-header-inner">
        <Link href="/" className="brand public-brand" aria-label="Gananza, inicio">
          <GananzaLogo variant="logo-tagline" size={44} priority />
        </Link>
        <nav className="launch-nav" aria-label="Navegacion principal">
          <Link href="#como-funciona">C&oacute;mo funciona</Link>
          <Link href="#seguridad">Estados</Link>
          <Link href="#seguridad">Seguridad</Link>
          <Link href="/soporte">Soporte</Link>
          <Link href="/acceso">Ingresar</Link>
          <Link href="/acceso" className="primary-button">Probar Gananza</Link>
        </nav>
      </div>
    </header>
  );
}
