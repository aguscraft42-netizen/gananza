import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icons";
import { TaskExplorer } from "@/components/TaskExplorer";
import { getAppContext, getCatalogTasks } from "@/lib/gananza/server-data";

export default async function TasksPage() {
  const [context, allTasks] = await Promise.all([
    getAppContext(),
    getCatalogTasks(),
  ]);

  const isStaff = context.roles.some((role) => ["admin", "reviewer", "support"].includes(role));
  const isProd = process.env.NODE_ENV === "production";

  // Ocultar tareas de prueba (isTest) para usuarios normales en producción
  const visibleTasks = allTasks.filter((task) => {
    if (task.isTest) {
      return !isProd || isStaff;
    }
    return true;
  });

  const count = (status: string) => visibleTasks.filter((task) => task.status === status).length;

  return (
    <AppShell active="/tareas">
      <section className="page-content">
        <div className="v3-page-heading">
          <div>
            <span className="eyebrow">OPORTUNIDADES</span>
            <h1>Elegí tu próxima tarea.</h1>
            <p>Compará objetivo, duración, validación y recompensa antes de empezar.</p>
          </div>
          <div className="heading-trust">
            <span><Icon name="shield" size={19} /></span>
            <div>
              <strong>{context.configured ? "Seguimiento protegido" : "Vista de demostración"}</strong>
              <small>{context.configured ? "Cada avance queda asociado a tu cuenta." : "Los cambios viven sólo en esta sesión."}</small>
            </div>
          </div>
        </div>
        <div className="state-overview">
          <article>
            <span className="status-dot available" />
            <div>
              <strong>1 activo</strong>
              <small>Proveedor de encuestas</small>
            </div>
          </article>
          <article>
            <span className="status-dot progress" />
            <div>
              <strong>{count("in_progress")} en progreso</strong>
              <small>Podés continuar</small>
            </div>
          </article>
          <article>
            <span className="status-dot pending" />
            <div>
              <strong>{count("pending")} pendientes</strong>
              <small>Esperando validación</small>
            </div>
          </article>
          <article>
            <span className="status-dot done" />
            <div>
              <strong>{count("confirmed")} confirmadas</strong>
              <small>Ya acreditadas</small>
            </div>
          </article>
        </div>
        <TaskExplorer
          initialTasks={visibleTasks}
          realMode={context.configured}
          user={context.user}
          profile={context.profile}
        />
      </section>
    </AppShell>
  );
}
