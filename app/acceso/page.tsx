import Link from "next/link";
import { AuthExperience } from "@/components/AuthExperience";
import { Icon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { isSupabaseEnabled } from "@/lib/env";

type Search = { mode?: string; error?: string; check_email?: string; reset_sent?: string; next?: string };
type Props = { searchParams: Promise<Search> };

export default async function AccessPage({ searchParams }: Props) {
  const query = await searchParams;
  const mode = query.mode === "login" || query.mode === "reset" ? query.mode : "register";

  return <main className="auth-page">
    <div className="auth-brand"><Logo/><Link href="/" className="text-button">← Volver al sitio</Link></div>
    <section className="auth-layout">
      <div className="auth-promise">
        <span className="eyebrow">SEGURIDAD Y TRANSPARENCIA</span>
        <h2>{isSupabaseEnabled ? "Tu cuenta, tus datos, tu Gananza." : "Explorá una experiencia financiera clara."}</h2>
        <p>{isSupabaseEnabled ? "Accedé a tus tareas, movimientos y retiros con una sesión protegida de punta a punta." : "Probá el producto completo sin ingresar información sensible."}</p>
        <div className="auth-feature-list">
          <article><i><Icon name="lock" size={18}/></i><div><strong>Acceso seguro</strong><span>Correo verificado y recuperación protegida.</span></div></article>
          <article><i><Icon name="shield" size={18}/></i><div><strong>Datos privados</strong><span>Cada cuenta accede únicamente a su información.</span></div></article>
          <article><i><Icon name="verified" size={18}/></i><div><strong>Movimientos auditables</strong><span>Estados y saldos siempre visibles.</span></div></article>
        </div>
      </div>
      <AuthExperience configured={isSupabaseEnabled} initialMode={mode} error={query.error} checkEmail={query.check_email === "1"} resetSent={query.reset_sent === "1"} next={query.next}/>
    </section>
  </main>;
}
