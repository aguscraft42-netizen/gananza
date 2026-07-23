import Link from "next/link";
import { GananzaLogo } from "@/components/brand/gananza-logo";

export default function NotFound() {
  return <main className="brand-state-page">
    <GananzaLogo variant="symbol" size={64} priority />
    <span className="eyebrow">ERROR 404</span>
    <h1>Esta página no está disponible.</h1>
    <p>Volvé al inicio para seguir explorando Gananza.</p>
    <Link className="primary-button" href="/">Ir al inicio</Link>
  </main>;
}
