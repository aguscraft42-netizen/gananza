import { redirect } from "next/navigation";
import { movements as demoMovements, tasks as demoTasks, type Task, type TaskCategory, type TaskStatus } from "@/lib/demo-data";
import { isSupabaseEnabled } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export { SURVEY_PROVIDER_SLUGS } from "@/lib/demo-data";

export type AppContext = {
  configured: boolean;
  user: { id: string; email: string } | null;
  profile: {
    displayName: string;
    avatarUrl?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    zipCode?: string | null;
    countryCode?: string;
    level: number;
    experiencePoints: number;
    streakDays: number;
    onboardingCompleted: boolean;
    hideBalance: boolean;
  };
  roles: string[];
  wallet: {
    available: number;
    pending: number;
    held: number;
    withdrawn: number;
    debt: number;
    lifetime: number;
  };
};

function categoryLabel(raw?: string): TaskCategory {
  if (raw === "games" || raw === "Juegos") return "Juegos";
  if (raw === "surveys" || raw === "Encuestas") return "Encuestas";
  if (raw === "apps" || raw === "Apps y servicios") return "Apps y servicios";
  return "Tareas rápidas";
}

function statusLabel(raw?: string): TaskStatus {
  if (raw === "in_progress") return "in_progress";
  if (raw === "submitted" || raw === "pending") return "pending";
  if (raw === "approved" || raw === "confirmed") return "confirmed";
  if (raw === "rejected") return "rejected";
  if (raw === "expired") return "expired";
  return "available";
}

export async function getAppContext(options?: { requireAuth?: boolean }): Promise<AppContext> {
  const requireAuth = options?.requireAuth ?? true;
  if (!isSupabaseEnabled) {
    return {
      configured: false,
      user: { id: "demo-user", email: "demo@gananza.app" },
      profile: {
        displayName: "Demo User",
        avatarUrl: null,
        countryCode: "AR",
        level: 4,
        experiencePoints: 3450,
        streakDays: 5,
        onboardingCompleted: true,
        hideBalance: false,
      },
      roles: ["admin", "reviewer", "support"],
      wallet: { available: 12500, pending: 2400, held: 5000, withdrawn: 18500, debt: 0, lifetime: 31000 },
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (requireAuth) redirect("/acceso");
    return {
      configured: true,
      user: null,
      profile: {
        displayName: "Invitado",
        avatarUrl: null,
        countryCode: "AR",
        level: 1,
        experiencePoints: 0,
        streakDays: 0,
        onboardingCompleted: true,
        hideBalance: false,
      },
      roles: [],
      wallet: { available: 0, pending: 0, held: 0, withdrawn: 0, debt: 0, lifetime: 0 },
    };
  }

  const [{ data: profile }, { data: wallet }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url, birth_date, gender, zip_code, country_code, level, experience_points, streak_days, onboarding_completed, hide_balance").eq("id", user.id).maybeSingle(),
    supabase.from("wallets").select("available_balance, pending_balance, held_balance, withdrawn_balance, debt_balance, lifetime_earned").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  return {
    configured: true,
    user: { id: user.id, email: user.email || "" },
    profile: profile ? {
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      birthDate: profile.birth_date,
      gender: profile.gender,
      zipCode: profile.zip_code,
      countryCode: profile.country_code || "AR",
      level: profile.level || 1,
      experiencePoints: profile.experience_points || 0,
      streakDays: profile.streak_days || 0,
      onboardingCompleted: profile.onboarding_completed ?? true,
      hideBalance: Boolean(profile.hide_balance),
    } : {
      displayName: user.email?.split("@")[0] || "Usuario",
      avatarUrl: null,
      countryCode: "AR",
      level: 1,
      experiencePoints: 0,
      streakDays: 0,
      onboardingCompleted: true,
      hideBalance: false,
    },
    roles: (roleRows || []).map((row: { role: string }) => row.role),
    wallet: {
      available: Number(wallet?.available_balance || 0),
      pending: Number(wallet?.pending_balance || 0),
      held: Number(wallet?.held_balance || 0),
      withdrawn: Number(wallet?.withdrawn_balance || 0),
      debt: Number(wallet?.debt_balance || 0),
      lifetime: Number(wallet?.lifetime_earned || 0),
    },
  };
}

export async function getActiveSurveyProvidersCount(): Promise<{ count: number; cpxConfigured: boolean }> {
  const cpxConfigured = Boolean(process.env.CPX_APP_ID && process.env.CPX_SECURE_HASH);
  if (!isSupabaseEnabled) {
    return { count: cpxConfigured ? 1 : 0, cpxConfigured };
  }

  try {
    const supabase = await createClient();
    const { data: activeProviders } = await supabase
      .from("providers")
      .select("slug, is_active")
      .eq("is_active", true);

    const surveyProviderSlugs = ["cpx-research"];
    const activeSurveyProviders = (activeProviders || []).filter((p: { slug: string; is_active: boolean }) =>
      surveyProviderSlugs.includes(p.slug)
    );

    const isCpxActiveInDb = (activeProviders || []).some((p: { slug: string }) => p.slug === "cpx-research");
    const count = activeSurveyProviders.length > 0 ? activeSurveyProviders.length : cpxConfigured && isCpxActiveInDb !== false ? 1 : 0;

    return {
      count,
      cpxConfigured: cpxConfigured && isCpxActiveInDb !== false,
    };
  } catch {
    return { count: cpxConfigured ? 1 : 0, cpxConfigured };
  }
}

export async function getCatalogTasks(): Promise<Task[]> {
  if (!isSupabaseEnabled) return demoTasks;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso");
  const [{ data: offers, error: offersError }, { data: sessions }] = await Promise.all([
    supabase.from("offers").select("id,title,brand,description,category,platform,reward_amount,estimated_minutes,validation_label,difficulty_label,badge_label,requirements,ends_at,metadata,external_offer_id,provider_id,providers(name)").eq("status", "active").order("reward_amount", { ascending: false }),
    supabase.from("task_sessions").select("offer_id,status,progress,updated_at").eq("user_id", user.id),
  ]);
  if (offersError) return [];
  const sessionByOffer = new Map((sessions || []).map((session: any) => [session.offer_id, session]));
  return (offers || []).map((offer: any): Task => {
    const session = sessionByOffer.get(offer.id) as any;
    const provider = Array.isArray(offer.providers) ? offer.providers[0]?.name : offer.providers?.name;
    const meta = offer.metadata && typeof offer.metadata === "object" ? offer.metadata : {};

    const metaIsTest = Boolean(meta.is_test || meta.environment === "test");
    const fallbackIsTest = Boolean(
      offer.external_offer_id?.startsWith("qa_") ||
      offer.external_offer_id?.startsWith("test_") ||
      String(offer.title || "").toLowerCase().includes("qa task") ||
      String(offer.title || "").toLowerCase().includes("tarea de prueba")
    );

    const isTest = metaIsTest || fallbackIsTest;

    return {
      id: offer.id,
      title: offer.title,
      brand: offer.brand,
      category: categoryLabel(offer.category),
      reward: Number(offer.reward_amount),
      time: offer.estimated_minutes ? `${offer.estimated_minutes} min` : "Variable",
      difficulty: offer.difficulty_label === "Media" ? "Media" : "Fácil",
      validation: offer.validation_label || "Según proveedor",
      platform: offer.platform || "Web",
      description: offer.description || "",
      badge: offer.badge_label || undefined,
      progress: session ? Number(session.progress || 0) : undefined,
      status: statusLabel(session?.status),
      deadline: offer.ends_at ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(offer.ends_at)) : "Cupos limitados",
      requirements: Array.isArray(offer.requirements) ? offer.requirements.map(String) : [],
      provider: provider || "Proveedor asociado",
      isTest,
    };
  });
}

export async function getLedgerMovements() {
  if (!isSupabaseEnabled) return demoMovements;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso");
  const { data } = await supabase.from("ledger_entries")
    .select("id,entry_type,pending_delta,available_delta,held_delta,withdrawn_delta,debt_delta,description,created_at")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  return (data || []).map((row: any) => {
    const pending = Number(row.pending_delta || 0);
    const available = Number(row.available_delta || 0);
    const held = Number(row.held_delta || 0);
    const withdrawn = Number(row.withdrawn_delta || 0);
    const debt = Number(row.debt_delta || 0);
    const entryType = String(row.entry_type || "");

    let amount: number;
    if (entryType.startsWith("reward_")) {
      amount = Math.abs(pending) || Math.abs(available) + Math.abs(debt);
      if (["reward_rejected", "reward_reversed"].includes(entryType)) amount *= -1;
    } else if (entryType.startsWith("withdrawal_")) {
      amount = -Math.max(Math.abs(available), Math.abs(held), Math.abs(withdrawn));
      if (entryType === "withdrawal_release") amount = Math.abs(amount);
    } else {
      const signed = pending + available + held + withdrawn - debt;
      amount = signed || Math.max(Math.abs(pending), Math.abs(available), Math.abs(held), Math.abs(withdrawn), Math.abs(debt));
    }

    const state =
      entryType === "reward_pending" ? "Pendiente" :
      entryType === "withdrawal_hold" ? "En revisión" :
      entryType === "withdrawal_paid" ? "Pagado" :
      entryType === "withdrawal_release" ? "Devuelto" :
      entryType.includes("rejected") || entryType.includes("reversed") ? "Revertido" :
      "Confirmado";

    return {
      id: row.id,
      label: row.description,
      date: new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(row.created_at)),
      amount,
      state,
    };
  });
}

export async function getPayoutMethods() {
  if (!isSupabaseEnabled) return [
    { id: "demo-mp", method_type: "mercado_pago", label: "Mercado Pago", destination_masked: "agu••••egh", holder_name: "Agustín Sayegh", is_default: true, is_verified: true, cooldown_until: null },
    { id: "demo-bank", method_type: "bank_transfer", label: "Transferencia a otro banco", destination_masked: "CBU •••• 0001", holder_name: "Agustín Sayegh", is_default: false, is_verified: false, cooldown_until: null },
  ];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso");
  const { data } = await supabase.from("payout_methods").select("id,method_type,label,destination_masked,holder_name,holder_document,is_default,is_verified,cooldown_until,last_used_at").eq("user_id", user.id).is("disabled_at", null).order("is_default", { ascending: false });
  return data || [];
}

export async function getAdminMetrics() {
  if (!isSupabaseEnabled) return { users: 1284, pending_conversions: 7, pending_withdrawals: 14, open_tickets: 11, open_fraud_flags: 5 };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_dashboard_metrics");
  if (error) return null;
  return data as Record<string, number>;
}

export async function getAdminQueue() {
  if (!isSupabaseEnabled) return [
    {
      id: "demo-1",
      userId: "00000000-0000-4000-8000-000000000001",
      user: "Lucía M.",
      userEmail: "lucia.m@demo.com",
      amount: 7200,
      method: "Mercado Pago",
      methodType: "mercado_pago",
      destination: "luc••••mp",
      holderName: "Lucía Martínez",
      holderDocument: "DNI •••• 8234",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      risk: 12,
      status: "requested",
      age: "2 h",
      availableBalance: 12500,
      heldBalance: 7200,
      pastWithdrawalsCount: 3,
      recentConversionsCount: 8,
      notes: "Solicitud de prueba demo",
    },
    {
      id: "demo-2",
      userId: "00000000-0000-4000-8000-000000000002",
      user: "Nicolás R.",
      userEmail: "nicolas.r@demo.com",
      amount: 5000,
      method: "Transferencia a otro banco",
      methodType: "bank_transfer",
      destination: "CBU •••• 4410",
      holderName: "Nicolás Rodríguez",
      holderDocument: "DNI •••• 1298",
      createdAt: new Date(Date.now() - 18000000).toISOString(),
      risk: 48,
      status: "reviewing",
      age: "5 h",
      availableBalance: 8200,
      heldBalance: 5000,
      pastWithdrawalsCount: 1,
      recentConversionsCount: 4,
      notes: "En revisión de seguridad",
    },
    {
      id: "demo-3",
      userId: "00000000-0000-4000-8000-000000000003",
      user: "Joel P.",
      userEmail: "joel.p@demo.com",
      amount: 8100,
      method: "Mercado Pago",
      methodType: "mercado_pago",
      destination: "joe••••ago",
      holderName: "Joel Pérez",
      holderDocument: "DNI •••• 4321",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      risk: 82,
      status: "approved",
      age: "1 día",
      availableBalance: 14500,
      heldBalance: 8100,
      pastWithdrawalsCount: 5,
      recentConversionsCount: 12,
      notes: "Aprobado por administración",
    },
  ];

  const supabase = await createClient();
  const { data } = await supabase
    .from("withdrawals")
    .select(`
      id,
      user_id,
      amount,
      status,
      created_at,
      payout_snapshot,
      payout_methods(label, method_type, destination_masked, holder_name, holder_document),
      profiles(display_name, risk_score)
    `)
    .in("status", ["requested", "reviewing", "approved"])
    .order("created_at", { ascending: true })
    .limit(30);

  return (data || []).map((row: any) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const method = Array.isArray(row.payout_methods) ? row.payout_methods[0] : row.payout_methods;
    const hours = Math.max(1, Math.round((Date.now() - new Date(row.created_at).getTime()) / 3600000));
    const snapshot = row.payout_snapshot && typeof row.payout_snapshot === "object" ? row.payout_snapshot : {};

    return {
      id: row.id,
      userId: row.user_id,
      user: profile?.display_name || row.user_id.slice(0, 8),
      userEmail: `${row.user_id.slice(0, 8)}@usuario.gananza`,
      amount: Number(row.amount),
      method: method?.label || snapshot.label || "Método",
      methodType: method?.method_type || snapshot.method_type || "bank_transfer",
      destination: method?.destination_masked || snapshot.destination_masked || "Destino protegido",
      holderName: method?.holder_name || snapshot.holder_name || "Titular registrado",
      holderDocument: method?.holder_document ? `DNI/CUIL •••• ${String(method.holder_document).slice(-4)}` : "Documento registrado",
      createdAt: row.created_at,
      risk: Number(profile?.risk_score || 0),
      status: row.status,
      age: hours < 24 ? `${hours} h` : `${Math.floor(hours / 24)} día`,
      availableBalance: 0,
      heldBalance: Number(row.amount),
      pastWithdrawalsCount: 0,
      recentConversionsCount: 0,
      notes: snapshot.note || "Solicitud registrada",
    };
  });
}

export async function getFraudFlags() {
  if (!isSupabaseEnabled) return [
    { id: "f1", description: "3 cuentas desde una misma huella.", reason_code: "shared_device", severity: "high", created_at: new Date().toISOString() },
    { id: "f2", description: "Inicio y callback desde regiones distintas.", reason_code: "country_mismatch", severity: "medium", created_at: new Date().toISOString() },
  ];
  const supabase = await createClient();
  const { data } = await supabase.from("fraud_flags").select("id,description,reason_code,severity,created_at").in("status", ["open","reviewing"]).order("created_at", { ascending: false }).limit(8);
  return data || [];
}
