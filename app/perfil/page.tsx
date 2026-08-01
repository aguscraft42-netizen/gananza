import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icons";
import { PayoutMethodsManager } from "@/components/PayoutMethodsManager";
import { signOutAction } from "@/app/auth/actions";
import { getAppContext, getPayoutMethods } from "@/lib/gananza/server-data";

export default async function ProfilePage() {
  const [context, methods] = await Promise.all([getAppContext(), getPayoutMethods()]);
  const initials = context.profile.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0,2).toUpperCase();

  return <AppShell active="/perfil"><section className="page-content">
    <div className="v3-page-heading">
      <div><span className="eyebrow">IDENTIDAD Y SEGURIDAD</span><h1>Tu perfil</h1><p>Administrá tu identidad, preferencias y destinos de retiro desde un solo lugar.</p></div>
      <span className="verification-pill"><Icon name="verified" size={14}/> {context.configured ? "CUENTA AUTENTICADA" : "CUENTA DEMO"}</span>
    </div>
    <div className="profile-grid">
      <aside className="profile-card profile-main">
        <div className="profile-avatar">{initials}<i /></div>
        <span className="eyebrow">PERFIL PERSONAL</span>
        <h2>{context.profile.displayName}</h2>
        <p>{context.user?.email}</p>
        <span className="verification-pill"><Icon name="shield" size={14}/> CORREO {context.configured ? "VERIFICADO" : "DEMO"}</span>
        <div className="profile-stats">
          <div className="profile-stat"><strong>{context.profile.level}</strong><small>Nivel</small></div>
          <div className="profile-stat"><strong>{context.profile.experiencePoints.toLocaleString("es-AR")}</strong><small>Puntos</small></div>
          <div className="profile-stat"><strong>{context.profile.streakDays}</strong><small>Racha</small></div>
        </div>
        <form action={signOutAction}><button className="text-button danger-text" type="submit">Cerrar sesión</button></form>
      </aside>
      <section className="profile-card">
        <div className="section-head"><div><span className="eyebrow">MÉTODOS DE RETIRO</span><h2>Destinos protegidos</h2><p>Mercado Pago es el método recomendado en Argentina. La transferencia a otro banco se mantiene como alternativa separada.</p></div></div>
        <PayoutMethodsManager initialMethods={methods as any[]} realMode={context.configured}/>
        <div className="security-banner"><span className="benefit-icon green"><Icon name="shield" size={20}/></span><div><strong>{context.configured ? "Privacidad por diseño" : "Listo para conectar"}</strong><small>{context.configured ? "Auth y RLS limitan cada consulta a tu propia cuenta." : "La demo no guarda información sensible."}</small></div></div>
        <div className="settings-list"><Link className="setting-row" href="/soporte"><span className="setting-icon"><Icon name="help"/></span><span className="setting-copy"><strong>Ayuda y soporte</strong><small>Preguntas frecuentes y seguimiento de tickets</small></span><Icon name="chevron" size={17}/></Link></div>
      </section>
    </div>
  </section></AppShell>;
}
