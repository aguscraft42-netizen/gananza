import { redirect } from "next/navigation";
import { isSupabaseEnabled } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { movements as demoMovements, tasks as demoTasks, type Task, type TaskStatus } from "@/lib/demo-data";

export type WalletSnapshot = {
  available: number;
  pending: number;
  held: number;
  withdrawn: number;
  debt: number;
  lifetime: number;
};

export type AppContext = {
  configured: boolean;
  user: { id: string; email: string } | null;
  profile: { displayName: string; level: number; experiencePoints: number; streakDays: number; hideBalance: boolean; onboardingCompleted: boolean };
  wallet: WalletSnapshot;
  roles: string[];
};

const demoContext: AppContext = {
  configured: false,
  user: { id: "demo-user", email: "agustin.demo@gananza.app" },
  profile: { displayName: "Agustín Sayegh", level: 3, experiencePoints: 3700, streakDays: 4, hideBalance: false, onboardingCompleted: true },
  wallet: { available: 8650, pending: 620, held: 0, withdrawn: 20830, debt: 0, lifetime: 29480 },
  roles: ["user", "admin"],
};

export async function getAppContext(options: { requireAuth?: boolean } = {}): Promise<AppContext> {
  if (!isSupabaseEnabled) return demoContext;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (options.requireAuth !== false) redirect("/acceso");
    return { ...demoContext, configured: true, user: null, roles: [] };
  }
  const [{ data: profile }, { data: wallet }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("display_name,level,experience_points,streak_days,hide_balance,onboarding_completed_at").eq("id", user.id).maybeSingle(),
    supabase.from("wallets").select("available_balance,pending_balance,held_balance,withdrawn_balance,debt_balance,lifetime_earned").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  return {
    configured: true,
    user: { id: user.id, email: user.email || "" },
    profile: {
      displayName: profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Usuario",
      level: Number(profile?.level || 1),
      experiencePoints: Number(profile?.experience_points || 0),
      streakDays: Number(profile?.streak_days || 0),
      hideBalance: Boolean(profile?.hide_balance),
      onboardingCompleted: Boolean(profile?.onboarding_completed_at),
    },
    wallet: {
      available: Number(wallet?.available_balance || 0),
      pending: Number(wallet?.pending_balance || 0),
      held: Number(wallet?.held_balance || 0),
      withdrawn: Number(wallet?.withdrawn_balance || 0),
      debt: Number(wallet?.debt_balance || 0),
      lifetime: Number(wallet?.lifetime_earned || 0),
    },
    roles: (roleRows || []).map((row: { role: string }) => row.role),
  };
}

function categoryLabel(value: string): Task["category"] {
  return value === "game" ? "Juegos" : value === "survey" ? "Encuestas" : value === "app" ? "Apps" : "Servicios";
}

function statusLabel(value?: string): TaskStatus {
  if (value === "started" || value === "registered") return "in_progress";
  if (value === "pending") return "pending";
  if (value === "confirmed") return "confirmed";
  if (value === "rejected" || value === "reversed") return "rejected";
  if (value === "expired") return "expired";
  return "available";
}

export async function getCatalogTasks(): Promise<Task[]> {
  if (!isSupabaseEnabled) return demoTasks;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso");
  const [{ data: offers, error: offersError }, { data: sessions }] = await Promise.all([
    supabase.from("offers").select("id,title,brand,description,category,platform,reward_amount,estimated_minutes,validation_label,difficulty_label,badge_label,requirements,ends_at,provider_id,providers(name)").eq("status", "active").order("reward_amount", { ascending: false }),
    supabase.from("task_sessions").select("offer_id,status,progress,updated_at").eq("user_id", user.id),
  ]);
  if (offersError) return [];
  const sessionByOffer = new Map((sessions || []).map((session: any) => [session.offer_id, session]));
  return (offers || []).map((offer: any): Task => {
    const session = sessionByOffer.get(offer.id) as any;
    const provider = Array.isArray(offer.providers) ? offer.providers[0]?.name : offer.providers?.name;
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
      // A reward can move between pending, available and debt in one atomic entry.
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
    { id: "demo-bank", method_type: "bank_transfer", label: "Transferencia bancaria", destination_masked: "CBU •••• 0001", holder_name: "Agustín Sayegh", is_default: false, is_verified: false, cooldown_until: null },
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
    { id: "demo-1", user: "Lucía M.", amount: 7200, method: "Mercado Pago", methodType: "mercado_pago", destination: "luc••••mp", risk: 12, status: "requested", age: "2 h" },
    { id: "demo-2", user: "Nicolás R.", amount: 5000, method: "Transferencia", methodType: "bank_transfer", destination: "•••• 4410", risk: 48, status: "reviewing", age: "5 h" },
    { id: "demo-3", user: "Joel P.", amount: 8100, method: "Mercado Pago", methodType: "mercado_pago", destination: "joe••••ago", risk: 82, status: "approved", age: "1 día" },
  ];
  const supabase = await createClient();
  const { data } = await supabase.from("withdrawals").select("id,user_id,amount,status,created_at,payout_snapshot,payout_methods(label,method_type,destination_masked),profiles(display_name,risk_score)").in("status", ["requested","reviewing","approved"]).order("created_at", { ascending: true }).limit(20);
  return (data || []).map((row: any) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const method = Array.isArray(row.payout_methods) ? row.payout_methods[0] : row.payout_methods;
    const hours = Math.max(1, Math.round((Date.now() - new Date(row.created_at).getTime()) / 3600000));
    const snapshot = row.payout_snapshot && typeof row.payout_snapshot === "object" ? row.payout_snapshot : {};
    return { id: row.id, user: profile?.display_name || row.user_id.slice(0, 8), amount: Number(row.amount), method: method?.label || snapshot.label || "Método", methodType: method?.method_type || snapshot.method_type || "bank_transfer", destination: method?.destination_masked || snapshot.destination_masked || "Destino protegido", risk: Number(profile?.risk_score || 0), status: row.status, age: hours < 24 ? `${hours} h` : `${Math.floor(hours/24)} día` };
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
