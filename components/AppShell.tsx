import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon, type IconName } from "./Icons";
import { Logo } from "./Logo";
import { GananzaLogo } from "@/components/brand/gananza-logo";
import { getAppContext } from "@/lib/gananza/server-data";

const links: Array<{ href: string; icon: IconName; label: string; mobileLabel?: string }> = [
  { href: "/dashboard", icon: "home", label: "Inicio" },
  { href: "/tareas", icon: "tasks", label: "Tareas" },
  { href: "/mi-gananza", icon: "gain", label: "Mi Gananza", mobileLabel: "Progreso" },
  { href: "/retiros", icon: "wallet", label: "Billetera" },
  { href: "/perfil", icon: "profile", label: "Perfil" },
];

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export async function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  const context = await getAppContext();
  if (context.configured && !context.profile.onboardingCompleted) redirect("/onboarding");
  const isStaff = context.roles.some((role) => ["support", "reviewer", "admin"].includes(role));
  const initials = context.profile.displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";
  const firstName = context.profile.displayName.split(" ")[0] || "Usuario";
  const levelProgress = Math.min(100, Math.round((context.profile.experiencePoints % 5000) / 50));

  return <div className="app-shell">
    <aside className="sidebar">
      <Logo />
      <span className="nav-label">PRINCIPAL</span>
      <nav className="side-nav" aria-label="Panel principal">
        {links.map((link) => <Link key={link.href} href={link.href} className={active === link.href ? "active" : ""}><span className="nav-icon"><Icon name={link.icon} /></span>{link.label}</Link>)}
      </nav>
      <span className="nav-label" style={{ marginTop: 22 }}>AYUDA</span>
      <nav className="side-nav"><Link href="/soporte" className={active === "/soporte" ? "active" : ""}><span className="nav-icon"><Icon name="help" /></span>Soporte</Link>{isStaff && <Link href="/admin" className={active === "/admin" ? "active" : ""}><span className="nav-icon"><Icon name="admin" /></span>Administración</Link>}</nav>
      <div className="sidebar-level"><div className="sidebar-level-head"><span className="level-token"><Icon name="medal" size={18}/></span><div><small>NIVEL {context.profile.level}</small><strong>{context.profile.level >= 4 ? "Avanzado" : "Explorador"}</strong></div></div><div className="level-progress"><span style={{ width: `${levelProgress}%` }} /></div><div className="level-caption"><span>{context.profile.experiencePoints.toLocaleString("es-AR")} puntos</span><span>5.000</span></div></div>
      <div className={`sidebar-status ${context.configured ? "connected" : ""}`}><span className="status-pulse" /><div><strong>{context.configured ? "Entorno protegido" : "Modo demostración"}</strong>{context.configured ? "Sesión segura · RLS activo" : "Vista previa sin datos reales"}</div></div>
    </aside>

    <main className="app-body">
      <header className="topbar"><Link href="/dashboard" className="mobile-brand" aria-label="Gananza, inicio"><GananzaLogo variant="logo" size={31} priority /></Link><label className="searchbox"><Icon name="search" /><input aria-label="Buscar tareas" placeholder="Buscar oportunidades" /></label><div className="top-actions"><Link href="/soporte" className="icon-button" aria-label="Ayuda"><Icon name="help" /></Link><button className="icon-button notification-button" aria-label="Notificaciones"><Icon name="bell" /><span /></button><Link href="/retiros" className="top-balance"><span className="top-balance-icon"><Icon name="wallet" size={17}/></span><span><small>Saldo disponible</small><strong>{context.profile.hideBalance ? "••••••" : currency.format(context.wallet.available)}</strong></span></Link><Link href="/perfil" className="account"><span><small>Nivel {context.profile.level}</small><strong>{firstName}</strong></span><div className="avatar">{initials}<i /></div></Link></div></header>
      {children}
    </main>
    <nav className="mobile-nav" aria-label="Navegación móvil">{links.map((link) => <Link key={link.href} href={link.href} className={active === link.href ? "active" : ""}><Icon name={link.icon} /><span>{link.mobileLabel ?? link.label}</span></Link>)}</nav>
  </div>;
}
