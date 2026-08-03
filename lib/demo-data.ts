export type TaskStatus = "available" | "in_progress" | "pending" | "confirmed" | "rejected" | "expired";

export type TaskCategory = "Juegos" | "Encuestas" | "Apps y servicios" | "Tareas rápidas";

// Slugs de proveedores cuyo catálogo principal es de encuestas
export const SURVEY_PROVIDER_SLUGS = ["cpx-research"] as const;

export type Task = {
  id: string;
  title: string;
  brand: string;
  category: TaskCategory;
  reward: number;
  time: string;
  difficulty: "Fácil" | "Media";
  validation: string;
  platform: string;
  description: string;
  badge?: string;
  progress?: number;
  status: TaskStatus;
  deadline: string;
  requirements: string[];
  provider: string;
  isTest?: boolean;
};

export const tasks: Task[] = [
  {
    id: "kingdom-harbor",
    title: "Alcanzá el nivel 12",
    brand: "Kingdom Harbor",
    category: "Juegos",
    reward: 4200,
    time: "3–5 días",
    difficulty: "Media",
    validation: "Hasta 24 h",
    platform: "Android",
    description: "Alcanzá el nivel 12 dentro de los próximos 14 días.",
    badge: "Más elegida",
    status: "available",
    deadline: "14 días desde el inicio",
    provider: "Red de juegos asociada",
    requirements: ["Instalá el juego desde Gananza.", "Usá una cuenta nueva.", "No desinstales hasta que la recompensa se confirme."],
  },
  {
    id: "habitos-digitales",
    title: "Hábitos digitales",
    brand: "Panel Opinión",
    category: "Encuestas",
    reward: 950,
    time: "8 min",
    difficulty: "Fácil",
    validation: "Inmediata",
    platform: "Web",
    description: "Respondé preguntas sobre compras online y consumo de contenido.",
    badge: "Nueva",
    status: "available",
    deadline: "Cupos limitados",
    provider: "Panel Opinión",
    requirements: ["Respondé con información real.", "No cierres la pestaña durante la encuesta.", "Solo se acredita una participación por persona."],
  },
  {
    id: "aulapro",
    title: "Probá una cuenta gratuita",
    brand: "AulaPro",
    category: "Apps y servicios",
    reward: 1800,
    time: "10 min",
    difficulty: "Fácil",
    validation: "Hasta 48 h",
    platform: "Web",
    description: "Creá una cuenta gratuita, verificá tu correo y recorré el catálogo.",
    badge: "Destacada",
    status: "available",
    deadline: "7 días",
    provider: "AulaPro",
    requirements: ["Registrate desde el enlace de Gananza.", "Verificá el correo.", "Visitá al menos tres cursos."],
  },
  {
    id: "metro-rush",
    title: "Completá el capítulo 3",
    brand: "Metro Rush",
    category: "Juegos",
    reward: 2700,
    time: "1–2 días",
    difficulty: "Media",
    validation: "Hasta 24 h",
    platform: "Android",
    description: "Continuá desde tu progreso actual y completá el capítulo 3.",
    badge: "En curso",
    progress: 62,
    status: "in_progress",
    deadline: "Vence en 9 días",
    provider: "Red de juegos asociada",
    requirements: ["Continuá con la misma cuenta.", "No uses emulador.", "Completá todo el capítulo 3."],
  },
  {
    id: "delivery",
    title: "Uso de delivery",
    brand: "Encuestas Directas",
    category: "Encuestas",
    reward: 620,
    time: "6 min",
    difficulty: "Fácil",
    validation: "En revisión",
    platform: "Web",
    description: "Contanos cómo elegís restaurantes, promociones y métodos de pago.",
    badge: "Validando",
    progress: 100,
    status: "pending",
    deadline: "Enviada hoy",
    provider: "Encuestas Directas",
    requirements: ["La respuesta ya fue enviada.", "La validación suele tardar menos de 24 horas.", "No hace falta repetir la tarea."],
  },
  {
    id: "nubecasa",
    title: "Configurá tu espacio",
    brand: "NubeCasa",
    category: "Apps y servicios",
    reward: 2300,
    time: "15 min",
    difficulty: "Fácil",
    validation: "Confirmada",
    platform: "Web",
    description: "Te registraste y configuraste tu primer espacio personal.",
    badge: "Confirmada",
    progress: 100,
    status: "confirmed",
    deadline: "Completada el 20 jul",
    provider: "NubeCasa",
    requirements: ["Tarea completada correctamente.", "La recompensa ya está en tu saldo disponible."],
  },
  {
    id: "fit-week",
    title: "Completá el perfil inicial",
    brand: "FitWeek",
    category: "Apps y servicios",
    reward: 1250,
    time: "12 min",
    difficulty: "Fácil",
    validation: "Rechazada",
    platform: "Android",
    description: "La tarea no pudo validarse porque la app ya había sido instalada.",
    badge: "Rechazada",
    status: "rejected",
    deadline: "Revisada el 19 jul",
    provider: "Red de aplicaciones",
    requirements: ["Esta campaña requería una instalación nueva.", "Podés consultar el motivo desde soporte."],
  },
  {
    id: "finanzas-cotidianas",
    title: "Encuesta sobre gastos",
    brand: "Pulso AR",
    category: "Encuestas",
    reward: 780,
    time: "7 min",
    difficulty: "Fácil",
    validation: "No disponible",
    platform: "Web",
    description: "La campaña alcanzó el límite de respuestas antes de que la iniciaras.",
    badge: "Finalizada",
    status: "expired",
    deadline: "Cupos agotados",
    provider: "Pulso AR",
    requirements: ["Esta tarea ya no acepta nuevas respuestas.", "Pronto aparecerán campañas similares."],
  },
];

export const movements = [
  { id: "m1", label: "Encuesta sobre streaming", date: "Hoy, 16:42", amount: 720, state: "Confirmada" },
  { id: "m2", label: "Uso de delivery", date: "Hoy, 15:18", amount: 620, state: "Pendiente" },
  { id: "m3", label: "Retiro a Mercado Pago", date: "18 jul, 10:30", amount: -5000, state: "Pagado" },
  { id: "m4", label: "Bono de racha", date: "17 jul, 22:05", amount: 180, state: "Confirmado" },
  { id: "m5", label: "NubeCasa", date: "16 jul, 18:22", amount: 2300, state: "Confirmada" },
];

export const statusCopy: Record<TaskStatus, { label: string; hint: string }> = {
  available: { label: "Disponible", hint: "Podés iniciarla ahora" },
  in_progress: { label: "En progreso", hint: "Seguí desde donde quedaste" },
  pending: { label: "Pendiente", hint: "Esperando validación" },
  confirmed: { label: "Confirmada", hint: "Recompensa acreditada" },
  rejected: { label: "Rechazada", hint: "Revisá el motivo" },
  expired: { label: "Finalizada", hint: "La campaña ya terminó" },
};
