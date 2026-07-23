import { GananzaLogo } from "@/components/brand/gananza-logo";

export default function Loading() {
  return <main className="brand-state-page" aria-live="polite">
    <GananzaLogo variant="symbol" size={58} priority />
    <span className="brand-loader" aria-hidden="true"/>
    <p>Preparando tu Gananza…</p>
  </main>;
}
