"use client";

import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "@/lib/demo-data";
import { Icon } from "./Icons";
import { StatusPill } from "./StatusPill";

const categories = ["Todas", "Juegos", "Encuestas", "Servicios", "Apps"] as const;

export function TaskExplorer({ initialTasks, realMode = false }: { initialTasks: Task[]; realMode?: boolean }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [category, setCategory] = useState<(typeof categories)[number]>("Todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [selected, setSelected] = useState<Task | null>(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const visible = useMemo(() => {
    let result = tasks.filter((task) => category === "Todas" || task.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((task) => `${task.brand} ${task.title} ${task.description}`.toLowerCase().includes(q));
    }
    if (sort === "reward") result = [...result].sort((a, b) => b.reward - a.reward);
    if (sort === "time") result = [...result].sort((a, b) => Number.parseInt(a.time) - Number.parseInt(b.time));
    if (sort === "status") {
      const order: Record<TaskStatus, number> = { available: 0, in_progress: 1, pending: 2, confirmed: 3, rejected: 4, expired: 5 };
      result = [...result].sort((a, b) => order[a.status] - order[b.status]);
    }
    return result;
  }, [tasks, category, query, sort]);

  async function updateStatus(task: Task, status: TaskStatus) {
    setBusy(true);
    try {
      if (realMode && status === "in_progress") {
        const response = await fetch("/api/tasks/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ offerId: task.id }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "No pudimos iniciar la tarea");
      }
      if (realMode && status === "pending") {
        setToast("La finalización llegará automáticamente desde el proveedor.");
        window.setTimeout(() => setToast(""), 3600);
        return;
      }
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status, progress: status === "in_progress" ? 8 : status === "pending" ? 100 : item.progress } : item));
      setSelected((current) => current ? { ...current, status, progress: status === "in_progress" ? 8 : status === "pending" ? 100 : current.progress } : current);
      setToast(status === "in_progress" ? "Tarea iniciada. Guardamos el seguimiento." : "Tarea enviada a validación.");
      window.setTimeout(() => setToast(""), 3200);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No pudimos actualizar la tarea.");
      window.setTimeout(() => setToast(""), 4200);
    } finally {
      setBusy(false);
    }
  }

  return <>
    <div className="task-search-row">
      <label className="catalog-search"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por tarea, marca o categoría" /></label>
      <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}>
        <option value="recommended">Recomendadas</option>
        <option value="reward">Mayor recompensa</option>
        <option value="time">Menor duración</option>
        <option value="status">Estado</option>
      </select>
    </div>
    <div className="toolbar">
      <div className="filter-row">{categories.map((item) => <button key={item} className={`filter-chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item} <b>{item === "Todas" ? tasks.length : tasks.filter((task) => task.category === item).length}</b></button>)}</div>
    </div>

    {visible.length ? <div className="task-grid">{visible.map((task) => {
      const kind = task.category === "Juegos" ? "game" : task.category === "Encuestas" ? "survey" : task.category === "Apps" ? "app" : "service";
      return <article className={`task-card task-state-${task.status}`} key={task.id}>
        <div className={`task-cover ${kind}`}><i className="cover-badge">{task.badge || "Oportunidad verificada"}</i><span className="cover-logo"><Icon name={kind} size={28} strokeWidth={1.7} /></span><StatusPill status={task.status} /></div>
        <div className="task-card-body">
          <div className="task-meta"><span className={`task-type ${kind}`}>{task.category.toUpperCase()}</span><span>{task.brand} · {task.platform}</span></div>
          <h3>{task.title}</h3><p>{task.description}</p>
          {typeof task.progress === "number" && <><div className="progress-caption"><span>Progreso</span><b>{task.progress}%</b></div><div className="level-progress"><span style={{ width: `${task.progress}%` }} /></div></>}
          <div className="task-facts"><div className="task-fact"><small>Tiempo</small><strong>{task.time}</strong></div><div className="task-fact"><small>Validación</small><strong>{task.validation}</strong></div><div className="task-fact"><small>Vigencia</small><strong>{task.deadline}</strong></div></div>
          <footer className="task-card-footer"><div className="reward-block"><small>RECOMPENSA</small><strong>${task.reward.toLocaleString("es-AR")}</strong></div><button className="task-button" onClick={() => setSelected(task)}>{task.status === "in_progress" ? "Continuar" : task.status === "pending" ? "Ver estado" : task.status === "confirmed" ? "Ver comprobante" : task.status === "rejected" ? "Ver motivo" : task.status === "expired" ? "Ver detalle" : "Ver tarea"}</button></footer>
        </div>
      </article>;
    })}</div> : <div className="empty-state"><span><Icon name="search" size={22}/></span><h3>No encontramos tareas con esos filtros</h3><p>Probá otra categoría o limpiá la búsqueda.</p><button className="secondary-button" onClick={() => { setCategory("Todas"); setQuery(""); }}>Limpiar filtros</button></div>}

    {selected && <div className="modal-backdrop open" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <article className="task-modal v4-modal">
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>
        <div className="modal-topline"><div className={`task-art ${selected.category === "Juegos" ? "game" : selected.category === "Encuestas" ? "survey" : "service"}`}><Icon name={selected.category === "Juegos" ? "game" : selected.category === "Encuestas" ? "survey" : "service"} size={30} /></div><div><StatusPill status={selected.status} /><h2>{selected.title}</h2><p>{selected.brand} · {selected.platform}</p></div></div>
        <div className="modal-summary"><div><small>RECOMPENSA</small><strong>${selected.reward.toLocaleString("es-AR")}</strong></div><div><small>TIEMPO</small><strong>{selected.time}</strong></div><div><small>VALIDACIÓN</small><strong>{selected.validation}</strong></div></div>
        <div className="task-status-explainer"><strong>{selected.status === "available" ? "Lista para empezar" : selected.status === "in_progress" ? "Tarea en curso" : selected.status === "pending" ? "Estamos esperando al proveedor" : selected.status === "confirmed" ? "Recompensa confirmada" : selected.status === "rejected" ? "No se pudo validar" : "Campaña finalizada"}</strong><span>{selected.status === "available" ? "Leé las condiciones y comenzá desde Gananza." : selected.status === "in_progress" ? `Llevás ${selected.progress ?? 0}% del objetivo.` : selected.status === "pending" ? "No repitas la tarea: podría generar un rechazo duplicado." : selected.status === "confirmed" ? "El importe ya forma parte de tu saldo disponible." : selected.status === "rejected" ? "Motivo de demo: la aplicación ya estaba instalada antes de iniciar." : "La campaña agotó sus cupos."}</span></div>
        <span className="eyebrow">CONDICIONES</span>
        <div className="requirement-list">{selected.requirements.map((item) => <div className="requirement" key={item}><i><Icon name="check" size={15} /></i><span>{item}</span></div>)}</div>
        <div className="provider-note"><span>Proveedor</span><strong>{selected.provider}</strong></div>
        <div className="warning-box">No uses VPN, emuladores ni varias cuentas. Eso puede invalidar la recompensa. {realMode ? "La confirmación llegará por callback del proveedor." : "En demo podés simular la finalización."}</div>
        <div className="modal-actions"><button className="secondary-button" onClick={() => setSelected(null)}>Cerrar</button>{selected.status === "available" && <button className="primary-button" disabled={busy} onClick={() => updateStatus(selected, "in_progress")}>{busy ? "Iniciando…" : "Comenzar tarea"}</button>}{selected.status === "in_progress" && (realMode ? <button className="primary-button" disabled>Seguimiento activo</button> : <button className="primary-button" disabled={busy} onClick={() => updateStatus(selected, "pending")}>Simular objetivo completado</button>)}{selected.status === "rejected" && <a className="primary-button" href="/soporte">Contactar soporte</a>}</div>
      </article>
    </div>}
    {toast && <div className="toast show"><span className="toast-icon"><Icon name="check" size={17} /></span><div><strong>Actualización guardada</strong><span>{toast}</span></div></div>}
  </>;
}
