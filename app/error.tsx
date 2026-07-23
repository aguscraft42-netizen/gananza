"use client";

import { GananzaLogo } from "@/components/brand/gananza-logo";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="brand-state-page">
    <GananzaLogo variant="logo" size={44} priority />
    <h1>No pudimos cargar esta sección.</h1>
    <p>Tu información permanece segura. Podés intentar nuevamente.</p>
    <button className="primary-button" onClick={reset}>Reintentar</button>
  </main>;
}
