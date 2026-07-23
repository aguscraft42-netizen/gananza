import Link from "next/link";
import { GananzaLogo } from "@/components/brand/gananza-logo";

export function Logo() {
  return <Link href="/" className="brand" aria-label="Gananza, inicio">
    <GananzaLogo variant="logo" theme="auto" size={42} className="brand-full" priority />
    <GananzaLogo variant="symbol" theme="auto" size={40} className="brand-symbol" priority />
  </Link>;
}
