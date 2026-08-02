import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icons";
import { HomeActivityChart } from "@/components/dashboard/HomeActivityChart";
import { HomeDashboardIcon, type HomeIconName } from "@/components/dashboard/HomeDashboardIcon";
import { getAppContext, getCatalogTasks, getLedgerMovements } from "@/lib/gananza/server-data";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export default async function DashboardPage() {
  const [context, tasks, movements] = await Promise.all([getAppContext(), getCatalogTasks(), getLedgerMovements()]);
  const recommended = tasks.filter((task) => ["available", "in_progress", "pending"].includes(task.status)).slice(0, 3);
  const availableCount = tasks.filter((task) => task.status === "available").length;
  const validCount = tasks.filter((task) => !["rejected", "expired"].includes(task.status)).length;
  const completedCount = tasks.filter((task) => task.status === "confirmed").length;
  const earnedToday = movements.filter((item) => item.date.startsWith("Hoy") && item.amount > 0).reduce((total, item) => total + item.amount, 0);
  const firstName = context.profile.displayName.split(" ")[0] || "Usuario";
  const hour = Number(new Intl.DateTimeFormat("es-AR", { hour: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" }).format(new Date()));
  const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const levelProgress = Math.min(100, Math.round((context.profile.experiencePoints / 5000) * 100));
  const levelName = context.profile.level >= 4 ? "Avanzado" : "Explorador";
  const chartSource = movements.slice(0, 7).reverse();
  const chartPoints = Array.from({ length: 7 }, (_, index) => ({
    label: chartSource[index]?.date.split(",")[0] || `D${index + 1}`,
    value: Math.max(0, chartSource[index]?.amount || 0),
  }));
  const metricItems: Array<{ label: string; value: string; detail: string; icon: HomeIconName; tone: string }> = [
    { label: "Ganado hoy", value: money.format(earnedToday), detail: earnedToday ? "Recompensas confirmadas" : "Sin acreditaciones hoy", icon: "activity", tone: "emerald" },
    { label: "Tareas válidas", value: String(validCount), detail: `${availableCount} disponibles`, icon: "verified", tone: "cyan" },
    { label: "Tareas completadas", value: String(completedCount), detail: "En el catálogo actual", icon: "tasks", tone: "violet" },
    { label: "Recompensas cobradas", value: context.profile.hideBalance ? "••••••" : money.format(context.wallet.withdrawn), detail: "Histórico retirado", icon: "rewards", tone: "gold" },
  ];

  return <AppShell active="/dashboard">
    <section className="page-content home-dashboard">
      <header className="home-welcome home-enter" style={{ "--home-delay": "0ms" } as React.CSSProperties}>
        <div><span className="home-eyebrow">{greeting}, {firstName}.</span><h1>Tu tiempo también puede sumar.</h1><p>Completá tareas, probá servicios y ganá recompensas reales.</p></div>
        <Link href="/tareas" className="primary-button home-primary-action">Explorar tareas <Icon name="arrow" size={18}/></Link>
      </header>

      <div className="home-overview-grid">
        <article className="home-balance-hero home-enter" style={{ "--home-delay": "70ms" } as React.CSSProperties}>
          <div className="home-balance-copy"><div className="home-card-kicker"><span>Saldo disponible</span><em><Icon name="verified" size={13}/>Actualizado</em></div><strong>{context.profile.hideBalance ? "••••••" : money.format(context.wallet.available)}</strong><p>Disponible para retirar</p><div className="home-balance-actions"><Link href="/retiros" className="home-solid-button">Retirar saldo <Icon name="arrow" size={17}/></Link><Link href="/mi-gananza" className="home-ghost-button">Ver billetera</Link></div></div>
          <div className="home-wallet-art" aria-hidden="true"><span className="wallet-ring ring-one"/><span className="wallet-ring ring-two"/><span className="wallet-ring ring-three"/><div className="wallet-stack"><i/><i/><i/><span><HomeDashboardIcon name="wallet" size={66}/></span></div></div>
        </article>

        <div className="home-side-cards">
          <article className="home-streak-card home-enter" style={{ "--home-delay": "120ms" } as React.CSSProperties}><div className="home-card-kicker"><span>Racha actual</span><HomeDashboardIcon name="streak" size={24}/></div><div className="home-streak-value"><strong>{context.profile.streakDays}</strong><span>días seguidos</span></div><div className="home-week-row">{["L","M","X","J","V","S","D"].map((day,index) => <span key={day} className={index < Math.min(context.profile.streakDays,7) ? "done" : index === Math.min(context.profile.streakDays,6) ? "today" : ""}><b>{day}</b><i>✓</i></span>)}</div></article>
          <article className="home-level-card home-enter" style={{ "--home-delay": "160ms" } as React.CSSProperties}><div className="home-card-kicker"><span>Nivel actual</span><Link href="/mi-gananza">Ver progreso</Link></div><div className="home-level-main"><span className="home-level-icon"><HomeDashboardIcon name="level" size={27}/></span><div><strong>{levelName}</strong><small>Nivel {context.profile.level}</small></div></div><div className="home-level-progress"><span style={{ width: `${levelProgress}%` }}/></div><div className="home-level-caption"><span>{context.profile.experiencePoints.toLocaleString("es-AR")} pts</span><span>5.000 pts</span></div></article>
        </div>
      </div>

      <div className="home-metrics-row">{metricItems.map((metric,index) => <article className={`home-stat home-enter ${metric.tone}`} style={{ "--home-delay": `${190 + index * 45}ms` } as React.CSSProperties} key={metric.label}><span><HomeDashboardIcon name={metric.icon} size={27}/></span><div><small>{metric.label}</small><strong>{metric.value}</strong><em>{metric.detail}</em></div></article>)}</div>

      <div className="home-content-grid">
        <section className="home-module home-activity-module home-enter" style={{ "--home-delay": "310ms" } as React.CSSProperties}><div className="home-module-head"><div><span className="home-eyebrow">Actividad reciente</span><h2>Tus últimas acciones en Gananza.</h2></div><span className="home-period">Últimos movimientos</span></div><HomeActivityChart points={chartPoints} formatValue={(value) => money.format(value)}/><div className="home-movement-strip">{movements.slice(0,3).map((item) => <div key={item.id}><span className={item.amount >= 0 ? "positive" : "negative"}><Icon name={item.amount < 0 ? "withdraw" : item.state.startsWith("Pend") ? "clock" : "verified"} size={16}/></span><p><strong>{item.label}</strong><small>{item.date}</small></p><b className={item.amount >= 0 ? "positive" : ""}>{item.amount >= 0 ? "+" : "−"}{money.format(Math.abs(item.amount))}</b></div>)}</div></section>

        <section className="home-module home-tasks-module home-enter" style={{ "--home-delay": "360ms" } as React.CSSProperties}><div className="home-module-head"><div><span className="home-eyebrow">Tareas recomendadas para vos</span><h2>Elegidas según tu perfil.</h2></div><Link href="/tareas">Ver todas <Icon name="chevron" size={16}/></Link></div><div className="home-task-list">{recommended.length ? recommended.map((task) => <Link href="/tareas" className="home-task-item" key={task.id}><span className={`home-task-badge ${task.category.toLowerCase()}`}><HomeDashboardIcon name="tasks" size={22}/></span><span><strong>{task.brand}</strong><small>{task.category} · {task.platform}</small></span><b>{money.format(task.reward)}</b><Icon name="chevron" size={17}/></Link>) : <div className="home-empty-state"><HomeDashboardIcon name="activity" size={42}/><div><strong>Aún no hay actividad</strong><p>Explorá nuevas tareas para empezar a sumar.</p></div><Link href="/tareas">Explorar tareas</Link></div>}</div></section>
      </div>

      <section className="home-trust-row home-enter" style={{ "--home-delay": "410ms" } as React.CSSProperties}>{[
        ["Entorno seguro y verificado","Tus datos permanecen protegidos.","secure"],
        ["Productos verificados","Revisamos cada oportunidad publicada.","verified"],
        ["Pagos asegurados","Cada movimiento conserva su estado.","rewards"],
        ["Privacidad garantizada","Tu información queda dentro de tu cuenta.","secure"],
      ].map(([title,copy,icon]) => <article key={title}><span><HomeDashboardIcon name={icon as HomeIconName} size={24}/></span><div><strong>{title}</strong><small>{copy}</small></div></article>)}</section>
    </section>
  </AppShell>;
}
