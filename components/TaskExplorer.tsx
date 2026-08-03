"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Task, TaskCategory, TaskStatus } from "@/lib/demo-data";
import { CpxSurveyWall } from "@/components/providers/cpx/CpxSurveyWall";
import { Icon } from "./Icons";
import { StatusPill } from "./StatusPill";

export type CategoryFilter = "Todas" | TaskCategory;

const categories: readonly CategoryFilter[] = [
  "Todas",
  "Juegos",
  "Encuestas",
  "Apps y servicios",
  "Tareas rápidas",
] as const;

type TaskExplorerProps = {
  initialTasks: Task[];
  realMode?: boolean;
  user?: { id: string; email: string } | null;
  profile?: { displayName: string; countryCode?: string; birthDate?: string | null } | null;
};

export function TaskExplorer({
  initialTasks,
  realMode = false,
  user,
  profile,
}: TaskExplorerProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [category, setCategory] = useState<CategoryFilter>("Todas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const [selected, setSelected] = useState<Task | null>(null);
  const [cpxWallOpen, setCpxWallOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);
  const backBtnRef = useRef<HTMLButtonElement | null>(null);

  // Bloqueo y restauración exacta del estilo de overflow previo
  useEffect(() => {
    if (cpxWallOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      backBtnRef.current?.focus();

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [cpxWallOpen]);

  // Cierre con tecla Escape para accesibilidad
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && cpxWallOpen) {
        setCpxWallOpen(false);
        triggerBtnRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cpxWallOpen]);

  const visible = useMemo(() => {
    let result = tasks.filter((task) => category === "Todas" || task.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((task) => `${task.brand} ${task.title} ${task.description} ${task.provider}`.toLowerCase().includes(q));
    }
    if (sort === "reward") result = [...result].sort((a, b) => b.reward - a.reward);
    if (sort === "time") result = [...result].sort((a, b) => Number.parseInt(a.time) - Number.parseInt(b.time));
    if (sort === "status") {
      const order: Record<TaskStatus, number> = { available: 0, in_progress: 1, pending: 2, confirmed: 3, rejected: 4, expired: 5 };
      result = [...result].sort((a, b) => order[a.status] - order[b.status]);
    }
    return result;
  }, [tasks, category, query, sort]);

  // El módulo CPX se muestra directamente en "Todas" y "Encuestas" cuando no hay búsqueda
  const showCpxModule = (category === "Todas" || category === "Encuestas") && !query.trim();

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

  const handleCloseOverlay = () => {
    setCpxWallOpen(false);
    triggerBtnRef.current?.focus();
  };

  return (
    <>
      <div className="task-search-row">
        <label className="catalog-search">
          <Icon name="search" size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por tarea, marca o categoría" />
        </label>
        <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="recommended">Recomendadas</option>
          <option value="reward">Mayor recompensa</option>
          <option value="time">Menor duración</option>
          <option value="status">Estado</option>
        </select>
      </div>
      <div className="toolbar">
        <div className="filter-row">
          {categories.map((item) => {
            const count = item === "Todas" ? tasks.length : tasks.filter((t) => t.category === item).length;
            return (
              <button key={item} className={`filter-chip ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>
                {item} <b>{count}</b>
              </button>
            );
          })}
        </div>
      </div>

      {showCpxModule && (
        <article className="cpx-feature-card" style={{ marginBottom: "24px", padding: "24px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(18, 20, 29, 0.8) 100%)", border: "1px solid rgba(124, 58, 237, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <span className="eyebrow" style={{ color: "#a78bfa", fontWeight: 700, letterSpacing: "0.08em" }}>ENCUESTAS</span>
            <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "20px", background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)", fontWeight: 600 }}>Proveedor activo</span>
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>Encuestas para tu perfil</h3>
          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5", maxWidth: "680px", marginBottom: "16px" }}>
            Respondé encuestas y recibí una recompensa cuando completes el estudio o cuando el proveedor otorgue un bono por participación.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              ref={triggerBtnRef}
              type="button"
              className="primary-button"
              onClick={() => setCpxWallOpen(true)}
              style={{ padding: "10px 22px", fontSize: "14px", fontWeight: 600 }}
            >
              Explorar encuestas
            </button>
            <span style={{ color: "#94a3b8", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="shield" size={15} /> Por CPX Research
            </span>
          </div>
          <small style={{ display: "block", color: "#64748b", fontSize: "12px", marginTop: "14px" }}>
            La disponibilidad y la posibilidad de calificar dependen de tu perfil y de los requisitos de cada estudio.
          </small>
        </article>
      )}

      {visible.length ? (
        <div className="task-grid">
          {visible.map((task) => {
            const kind = task.category === "Juegos" ? "game" : task.category === "Encuestas" ? "survey" : "app";
            return (
              <article className={`task-card task-state-${task.status}`} key={task.id}>
                <div className={`task-cover ${kind}`}>
                  <i className="cover-badge">{task.badge || "Oportunidad verificada"}</i>
                  <span className="cover-logo"><Icon name={kind} size={26} strokeWidth={1.7} /></span>
                  <StatusPill status={task.status} />
                </div>
                <div className="task-card-body">
                  <div className="task-meta">
                    <span className={`task-type ${kind}`}>{task.category.toUpperCase()}</span>
                    <span>Por {task.provider}</span>
                  </div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  {task.status !== "available" && typeof task.progress === "number" && (
                    <>
                      <div className="progress-caption"><span>Progreso</span><b>{task.progress}%</b></div>
                      <div className="level-progress"><span style={{ width: `${task.progress}%` }} /></div>
                    </>
                  )}
                  <div className="task-facts">
                    <div className="task-fact"><small>Tiempo</small><strong>{task.time}</strong></div>
                    <div className="task-fact"><small>Validación</small><strong>{task.validation}</strong></div>
                    <div className="task-fact"><small>Plataforma</small><strong>{task.platform}</strong></div>
                  </div>
                  <footer className="task-card-footer">
                    <div className="reward-block"><small>RECOMPENSA</small><strong>${task.reward.toLocaleString("es-AR")}</strong></div>
                    <button type="button" className="task-button" onClick={() => setSelected(task)}>
                      {task.status === "in_progress" ? "Continuar" : task.status === "pending" ? "Ver estado" : task.status === "confirmed" ? "Ver comprobante" : task.status === "rejected" ? "Ver motivo" : task.status === "expired" ? "Ver detalle" : "Ver tarea"}
                    </button>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      ) : !showCpxModule ? (
        <div className="empty-state" style={{ padding: "48px 24px", textAlign: "center", background: "rgba(18, 20, 29, 0.4)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <span style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(124, 58, 237, 0.1)", color: "#a78bfa", marginBottom: "16px" }}>
            <Icon name="search" size={28} />
          </span>
          <h3 style={{ fontSize: "18px", color: "#f8fafc", marginBottom: "8px" }}>Nuevas oportunidades próximamente</h3>
          <p style={{ color: "#cbd5e1", fontSize: "14px", maxWidth: "460px", margin: "0 auto 20px auto" }}>
            Mientras ampliamos el catálogo, podés explorar las encuestas disponibles para tu perfil.
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setCategory("Encuestas");
              setQuery("");
              setCpxWallOpen(true);
            }}
          >
            Ver encuestas
          </button>
        </div>
      ) : null}

      {/* Offerwall de CPX en Modal Overlay Full-Viewport con Safe Areas de iOS */}
      {cpxWallOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="CPX Research Pared de Encuestas"
          className="cpx-overlay-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#0c0e14",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#12141d", position: "sticky", top: 0, zIndex: 100 }}>
            <button
              ref={backBtnRef}
              type="button"
              className="secondary-button"
              onClick={handleCloseOverlay}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600 }}
            >
              ← Volver a Gananza
            </button>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>CPX Research · Pared de encuestas</span>
          </div>
          <div style={{ flex: 1, padding: "16px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
            <CpxSurveyWall
              userId={user?.id || "demo-user"}
              email={user?.email}
              displayName={profile?.displayName}
              countryCode={profile?.countryCode}
              birthDate={profile?.birthDate}
            />
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop open" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <article className="task-modal v4-modal">
            <button type="button" className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>
            <div className="modal-topline">
              <div className={`task-art ${selected.category === "Juegos" ? "game" : selected.category === "Encuestas" ? "survey" : "service"}`}>
                <Icon name={selected.category === "Juegos" ? "game" : selected.category === "Encuestas" ? "survey" : "service"} size={30} />
              </div>
              <div>
                <StatusPill status={selected.status} />
                <h2>{selected.title}</h2>
                <p>{selected.brand} · {selected.platform}</p>
              </div>
            </div>
            <div className="modal-summary">
              <div><small>RECOMPENSA</small><strong>${selected.reward.toLocaleString("es-AR")}</strong></div>
              <div><small>TIEMPO</small><strong>{selected.time}</strong></div>
              <div><small>VALIDACIÓN</small><strong>{selected.validation}</strong></div>
            </div>
            <div className="task-status-explainer">
              <strong>{selected.status === "available" ? "Lista para empezar" : selected.status === "in_progress" ? "Tarea en curso" : selected.status === "pending" ? "Estamos esperando al proveedor" : selected.status === "confirmed" ? "Recompensa confirmada" : selected.status === "rejected" ? "No se pudo validar" : "Campaña finalizada"}</strong>
              <span>{selected.status === "available" ? "Leé las condiciones y comenzá desde Gananza." : selected.status === "in_progress" ? `Llevás ${selected.progress ?? 0}% del objetivo.` : selected.status === "pending" ? "No repitas la tarea: podría generar un rechazo duplicado." : selected.status === "confirmed" ? "El importe ya forma parte de tu saldo disponible." : selected.status === "rejected" ? "Motivo de demo: la aplicación ya estaba instalada antes de iniciar." : "La campaña agotó sus cupos."}</span>
            </div>
            <span className="eyebrow">CONDICIONES</span>
            <div className="requirement-list">
              {selected.requirements.map((item) => (
                <div className="requirement" key={item}>
                  <i><Icon name="check" size={15} /></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="provider-note"><span>Proveedor</span><strong>{selected.provider}</strong></div>
            <div className="warning-box">No uses VPN, emuladores ni varias cuentas. Eso puede invalidar la recompensa. {realMode ? "La confirmación llegará por callback del proveedor." : "En demo podés simular la finalización."}</div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setSelected(null)}>Cerrar</button>
              {selected.status === "available" && <button type="button" className="primary-button" disabled={busy} onClick={() => updateStatus(selected, "in_progress")}>{busy ? "Iniciando…" : "Comenzar tarea"}</button>}
              {selected.status === "in_progress" && (realMode ? <button type="button" className="primary-button" disabled>Seguimiento activo</button> : <button type="button" className="primary-button" disabled={busy} onClick={() => updateStatus(selected, "pending")}>Simular objetivo completado</button>)}
              {selected.status === "rejected" && <a className="primary-button" href="/soporte">Contactar soporte</a>}
            </div>
          </article>
        </div>
      )}
      {toast && <div className="toast show"><span className="toast-icon"><Icon name="check" size={17} /></span><div><strong>Actualización guardada</strong><span>{toast}</span></div></div>}
    </>
  );
}
