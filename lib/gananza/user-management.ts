import { isSupabaseEnabled } from "../env.ts";

export type AdminUserSummary = {
  id: string;
  displayName: string;
  email: string;
  countryCode: string;
  createdAt: string;
  suspendedAt: string | null;
  suspensionReason: string | null;
  riskScore: number;
  level: number;
  experiencePoints: number;
  availableBalance: number;
  pendingBalance: number;
  heldBalance: number;
  withdrawnBalance: number;
  conversionsCount: number;
  withdrawalsCount: number;
};

export type AdminUserDetail = AdminUserSummary & {
  birthDate?: string | null;
  interests?: string[];
  payoutPreference?: string;
  streakDays: number;
  hideBalance: boolean;
  ledgerEntries: Array<{
    id: string;
    entryType: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
  recentConversions: Array<{
    id: string;
    offerTitle: string;
    rewardAmount: number;
    status: string;
    createdAt: string;
  }>;
  recentWithdrawals: Array<{
    id: string;
    amount: number;
    methodLabel: string;
    status: string;
    createdAt: string;
  }>;
  supportTickets: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  auditHistory: Array<{
    id: number;
    action: string;
    actorId?: string | null;
    actorName?: string;
    note?: string | null;
    createdAt: string;
  }>;
};

// Usuarios Demo para entorno local o testing
const DEMO_USERS: AdminUserDetail[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    displayName: "Lucía Martínez",
    email: "lucia.martinez@demo.com",
    countryCode: "AR",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    suspendedAt: null,
    suspensionReason: null,
    riskScore: 12,
    level: 4,
    experiencePoints: 4200,
    streakDays: 8,
    hideBalance: false,
    birthDate: "1996-05-14",
    interests: ["juegos", "encuestas"],
    payoutPreference: "mercado_pago",
    availableBalance: 12500,
    pendingBalance: 2400,
    heldBalance: 7200,
    withdrawnBalance: 18500,
    conversionsCount: 14,
    withdrawalsCount: 3,
    ledgerEntries: [
      { id: "leg-1", entryType: "reward_confirmed", amount: 2500, description: "Recompensa encuestas CPX", createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "leg-2", entryType: "withdrawal_hold", amount: -7200, description: "Retiro retenido Mercado Pago", createdAt: new Date(Date.now() - 7200000).toISOString() },
    ],
    recentConversions: [
      { id: "conv-1", offerTitle: "Encuesta CPX Consumo", rewardAmount: 2500, status: "confirmed", createdAt: new Date(Date.now() - 3600000).toISOString() },
    ],
    recentWithdrawals: [
      { id: "w-1", amount: 7200, methodLabel: "Mercado Pago", status: "requested", createdAt: new Date(Date.now() - 7200000).toISOString() },
    ],
    supportTickets: [
      { id: "t-1", subject: "Duda con validación de tarea", status: "resolved", priority: "normal", createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
    auditHistory: [
      { id: 101, action: "user_registered", actorId: "00000000-0000-4000-8000-000000000001", actorName: "Sistema", note: "Registro inicial de cuenta", createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    displayName: "Nicolás Rodríguez",
    email: "nicolas.rodriguez@demo.com",
    countryCode: "AR",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    suspendedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    suspensionReason: "Revisión preventiva por múltiples intentos con datos inconsistentes.",
    riskScore: 78,
    level: 2,
    experiencePoints: 1100,
    streakDays: 0,
    hideBalance: false,
    birthDate: "1992-11-20",
    interests: ["apps"],
    payoutPreference: "bank_transfer",
    availableBalance: 8200,
    pendingBalance: 0,
    heldBalance: 5000,
    withdrawnBalance: 5000,
    conversionsCount: 4,
    withdrawalsCount: 2,
    ledgerEntries: [
      { id: "leg-3", entryType: "withdrawal_hold", amount: -5000, description: "Retiro retenido Banco Santander", createdAt: new Date(Date.now() - 18000000).toISOString() },
    ],
    recentConversions: [],
    recentWithdrawals: [
      { id: "w-2", amount: 5000, methodLabel: "Transferencia a otro banco", status: "reviewing", createdAt: new Date(Date.now() - 18000000).toISOString() },
    ],
    supportTickets: [],
    auditHistory: [
      { id: 102, action: "user_suspended", actorId: "admin-user", actorName: "Admin Soporte", note: "Revisión preventiva por múltiples intentos con datos inconsistentes.", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    displayName: "Joel Pérez",
    email: "joel.perez@demo.com",
    countryCode: "AR",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    suspendedAt: null,
    suspensionReason: null,
    riskScore: 24,
    level: 3,
    experiencePoints: 2800,
    streakDays: 4,
    hideBalance: false,
    birthDate: "1998-03-08",
    interests: ["juegos"],
    payoutPreference: "mercado_pago",
    availableBalance: 14500,
    pendingBalance: 1200,
    heldBalance: 8100,
    withdrawnBalance: 12000,
    conversionsCount: 18,
    withdrawalsCount: 5,
    ledgerEntries: [],
    recentConversions: [],
    recentWithdrawals: [],
    supportTickets: [],
    auditHistory: [],
  },
];

export async function getAdminUsersList(options?: { query?: string; status?: "all" | "active" | "suspended" }): Promise<AdminUserSummary[]> {
  const query = options?.query?.trim().toLowerCase() || "";
  const statusFilter = options?.status || "all";

  if (!isSupabaseEnabled) {
    return DEMO_USERS.filter((u) => {
      const matchQuery =
        !query ||
        u.displayName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query);

      const isSuspended = Boolean(u.suspendedAt);
      const matchStatus =
        statusFilter === "all" ? true : statusFilter === "suspended" ? isSuspended : !isSuspended;

      return matchQuery && matchStatus;
    });
  }

  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();

  let req = supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      country_code,
      created_at,
      suspended_at,
      suspension_reason,
      risk_score,
      level,
      experience_points,
      wallets(available_balance, pending_balance, held_balance, withdrawn_balance)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter === "active") {
    req = req.is("suspended_at", null);
  } else if (statusFilter === "suspended") {
    req = req.not("suspended_at", "is", null);
  }

  const { data: profiles, error } = await req;
  if (error || !profiles) return [];

  const results: AdminUserSummary[] = profiles.map((p: any) => {
    const wallet = Array.isArray(p.wallets) ? p.wallets[0] : p.wallets;
    return {
      id: p.id,
      displayName: p.display_name || p.id.slice(0, 8),
      email: `${p.id.slice(0, 8)}@usuario.gananza`,
      countryCode: p.country_code || "AR",
      createdAt: p.created_at,
      suspendedAt: p.suspended_at,
      suspensionReason: p.suspension_reason,
      riskScore: p.risk_score || 0,
      level: p.level || 1,
      experiencePoints: p.experience_points || 0,
      availableBalance: Number(wallet?.available_balance || 0),
      pendingBalance: Number(wallet?.pending_balance || 0),
      heldBalance: Number(wallet?.held_balance || 0),
      withdrawnBalance: Number(wallet?.withdrawn_balance || 0),
      conversionsCount: 0,
      withdrawalsCount: 0,
    };
  });

  if (!query) return results;

  return results.filter(
    (u) =>
      u.displayName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query)
  );
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  if (!isSupabaseEnabled) {
    const found = DEMO_USERS.find((u) => u.id === userId);
    return found || DEMO_USERS[0];
  }

  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();

  const [{ data: profile }, { data: wallet }, { data: ledger }, { data: conversions }, { data: withdrawals }, { data: tickets }, { data: audit }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("ledger_entries").select("id,entry_type,available_delta,pending_delta,held_delta,withdrawn_delta,description,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("conversions").select("id,reward_amount,status,created_at,offers(title)").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("withdrawals").select("id,amount,status,created_at,payout_methods(label)").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("support_tickets").select("id,subject,status,priority,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("audit_logs").select("id,action,actor_id,after_data,created_at").eq("entity_id", userId).order("created_at", { ascending: false }).limit(15),
    ]);

  if (!profile) return null;

  return {
    id: profile.id,
    displayName: profile.display_name || profile.id.slice(0, 8),
    email: `${profile.id.slice(0, 8)}@usuario.gananza`,
    countryCode: profile.country_code || "AR",
    createdAt: profile.created_at,
    suspendedAt: profile.suspended_at,
    suspensionReason: profile.suspension_reason,
    riskScore: profile.risk_score || 0,
    level: profile.level || 1,
    experiencePoints: profile.experience_points || 0,
    streakDays: profile.streak_days || 0,
    hideBalance: Boolean(profile.hide_balance),
    birthDate: profile.birth_date,
    interests: profile.interests || [],
    payoutPreference: profile.payout_preference || "mercado_pago",
    availableBalance: Number(wallet?.available_balance || 0),
    pendingBalance: Number(wallet?.pending_balance || 0),
    heldBalance: Number(wallet?.held_balance || 0),
    withdrawnBalance: Number(wallet?.withdrawn_balance || 0),
    conversionsCount: conversions?.length || 0,
    withdrawalsCount: withdrawals?.length || 0,
    ledgerEntries: (ledger || []).map((row: any) => ({
      id: row.id,
      entryType: row.entry_type,
      amount: Number(row.available_delta || row.pending_delta || row.held_delta || 0),
      description: row.description,
      createdAt: row.created_at,
    })),
    recentConversions: (conversions || []).map((row: any) => ({
      id: row.id,
      offerTitle: Array.isArray(row.offers) ? row.offers[0]?.title : row.offers?.title || "Conversión",
      rewardAmount: Number(row.reward_amount || 0),
      status: row.status,
      createdAt: row.created_at,
    })),
    recentWithdrawals: (withdrawals || []).map((row: any) => ({
      id: row.id,
      amount: Number(row.amount || 0),
      methodLabel: Array.isArray(row.payout_methods) ? row.payout_methods[0]?.label : row.payout_methods?.label || "Método",
      status: row.status,
      createdAt: row.created_at,
    })),
    supportTickets: (tickets || []).map((row: any) => ({
      id: row.id,
      subject: row.subject,
      status: row.status,
      priority: row.priority,
      createdAt: row.created_at,
    })),
    auditHistory: (audit || []).map((row: any) => ({
      id: row.id,
      action: row.action,
      actorId: row.actor_id,
      actorName: row.actor_id ? `Admin (${row.actor_id.slice(0, 8)})` : "Sistema",
      note: row.after_data?.suspension_reason || row.after_data?.note || null,
      createdAt: row.created_at,
    })),
  };
}

export async function updateUserStatus(
  userId: string,
  action: "suspend" | "reactivate",
  reason?: string,
  actorId: string = "admin-system"
): Promise<{ ok: boolean; error?: string }> {
  const cleanReason = reason?.trim() || "";

  if (action === "suspend" && !cleanReason) {
    return { ok: false, error: "El motivo de suspensión es obligatorio." };
  }

  if (!isSupabaseEnabled) {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      if (action === "suspend") {
        user.suspendedAt = new Date().toISOString();
        user.suspensionReason = cleanReason;
        user.auditHistory.unshift({
          id: Date.now(),
          action: "user_suspended",
          actorId,
          actorName: "Administrador Demo",
          note: cleanReason,
          createdAt: new Date().toISOString(),
        });
      } else {
        user.suspendedAt = null;
        user.suspensionReason = null;
        user.auditHistory.unshift({
          id: Date.now(),
          action: "user_reactivated",
          actorId,
          actorName: "Administrador Demo",
          note: "Reactivación de cuenta",
          createdAt: new Date().toISOString(),
        });
      }
    }
    return { ok: true };
  }

  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.rpc("manage_user_status", {
    p_target_user_id: userId,
    p_action: action,
    p_reason: action === "suspend" ? cleanReason : null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
