import { isSupabaseEnabled } from "../env.ts";

export type AdminConversionSummary = {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  providerId: string;
  providerName: string;
  providerSlug: string;
  externalTransactionId: string;
  conversionType: string;
  amountUsd: number;
  payoutAmountLocal: number;
  userRewardLocal: number;
  status: "pending" | "confirmed" | "rejected" | "reversed";
  isDuplicate: boolean;
  createdAt: string;
  confirmedAt?: string | null;
  rejectedAt?: string | null;
  reversedAt?: string | null;
};

export type AdminConversionDetail = AdminConversionSummary & {
  offerTitle?: string;
  taskSessionId?: string | null;
  rawPayload: Record<string, any>;
  ledgerEntry?: {
    id: string;
    entryType: string;
    availableDelta: number;
    pendingDelta: number;
    description: string;
    createdAt: string;
  } | null;
};

// Datos Demo para visualización sin Supabase
const DEMO_CONVERSIONS: AdminConversionDetail[] = [
  {
    id: "conv-101",
    userId: "00000000-0000-4000-8000-000000000001",
    userDisplayName: "Lucía Martínez",
    userEmail: "lucia.martinez@demo.com",
    providerId: "prov-cpx",
    providerName: "CPX Research",
    providerSlug: "cpx-research",
    externalTransactionId: "CPX-TX-998124",
    conversionType: "Encuesta Completada",
    amountUsd: 2.5,
    payoutAmountLocal: 3125,
    userRewardLocal: 2500,
    status: "confirmed",
    isDuplicate: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    confirmedAt: new Date(Date.now() - 3500000).toISOString(),
    offerTitle: "Encuesta CPX Hábitos de Consumo",
    taskSessionId: "session-101",
    rawPayload: {
      trans_id: "CPX-TX-998124",
      user_id: "00000000-0000-4000-8000-000000000001",
      status: "1",
      amount_usd: "2.50",
      amount_local: "3125",
      ip: "181.44.120.5",
    },
    ledgerEntry: {
      id: "leg-101",
      entryType: "reward_confirmed",
      availableDelta: 2500,
      pendingDelta: 0,
      description: "Recompensa encuestas CPX",
      createdAt: new Date(Date.now() - 3500000).toISOString(),
    },
  },
  {
    id: "conv-102",
    userId: "00000000-0000-4000-8000-000000000001",
    userDisplayName: "Lucía Martínez",
    userEmail: "lucia.martinez@demo.com",
    providerId: "prov-cpx",
    providerName: "CPX Research",
    providerSlug: "cpx-research",
    externalTransactionId: "CPX-TX-998125",
    conversionType: "Bonus Screenout",
    amountUsd: 0.08,
    payoutAmountLocal: 100,
    userRewardLocal: 10,
    status: "confirmed",
    isDuplicate: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    confirmedAt: new Date(Date.now() - 7100000).toISOString(),
    offerTitle: "Compensación por descalificación CPX",
    taskSessionId: "session-102",
    rawPayload: {
      trans_id: "CPX-TX-998125",
      user_id: "00000000-0000-4000-8000-000000000001",
      status: "1",
      amount_usd: "0.08",
      sub_type: "screenout_bonus",
    },
    ledgerEntry: {
      id: "leg-102",
      entryType: "bonus",
      availableDelta: 10,
      pendingDelta: 0,
      description: "Bonus de consuelo CPX Research",
      createdAt: new Date(Date.now() - 7100000).toISOString(),
    },
  },
  {
    id: "conv-103",
    userId: "00000000-0000-4000-8000-000000000002",
    userDisplayName: "Nicolás Rodríguez",
    userEmail: "nicolas.rodriguez@demo.com",
    providerId: "prov-theorem",
    providerName: "TheoremReach",
    providerSlug: "theoremreach",
    externalTransactionId: "TR-TX-441209",
    conversionType: "Encuesta Pendiente",
    amountUsd: 1.2,
    payoutAmountLocal: 1500,
    userRewardLocal: 1200,
    status: "pending",
    isDuplicate: false,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    offerTitle: "Estudio de Mercado Automotriz",
    taskSessionId: "session-103",
    rawPayload: {
      tx_id: "TR-TX-441209",
      status: "pending_verification",
    },
    ledgerEntry: {
      id: "leg-103",
      entryType: "reward_pending",
      availableDelta: 0,
      pendingDelta: 1200,
      description: "Recompensa pendiente TheoremReach",
      createdAt: new Date(Date.now() - 18000000).toISOString(),
    },
  },
  {
    id: "conv-104",
    userId: "00000000-0000-4000-8000-000000000002",
    userDisplayName: "Nicolás Rodríguez",
    userEmail: "nicolas.rodriguez@demo.com",
    providerId: "prov-cpx",
    providerName: "CPX Research",
    providerSlug: "cpx-research",
    externalTransactionId: "CPX-TX-998124",
    conversionType: "Reversión por Fraude",
    amountUsd: 2.5,
    payoutAmountLocal: 3125,
    userRewardLocal: -2500,
    status: "reversed",
    isDuplicate: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reversedAt: new Date(Date.now() - 85000000).toISOString(),
    offerTitle: "Encuesta CPX duplicada o revertida",
    taskSessionId: "session-104",
    rawPayload: {
      trans_id: "CPX-TX-998124",
      status: "2",
      reason: "chargeback_from_advertiser",
    },
    ledgerEntry: {
      id: "leg-104",
      entryType: "reward_reversed",
      availableDelta: -2500,
      pendingDelta: 0,
      description: "Reversión por contracargo CPX",
      createdAt: new Date(Date.now() - 85000000).toISOString(),
    },
  },
];

export async function getAdminConversionsList(options?: {
  query?: string;
  provider?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<AdminConversionSummary[]> {
  const query = options?.query?.trim().toLowerCase() || "";
  const providerFilter = options?.provider || "all";
  const statusFilter = options?.status || "all";
  const fromDate = options?.fromDate ? new Date(options.fromDate).getTime() : null;
  const toDate = options?.toDate ? new Date(options.toDate).getTime() : null;

  if (!isSupabaseEnabled) {
    return DEMO_CONVERSIONS.filter((c) => {
      const matchQuery =
        !query ||
        c.userDisplayName.toLowerCase().includes(query) ||
        c.userEmail.toLowerCase().includes(query) ||
        c.userId.toLowerCase().includes(query) ||
        c.externalTransactionId.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query);

      const matchProvider = providerFilter === "all" ? true : c.providerSlug === providerFilter;
      const matchStatus = statusFilter === "all" ? true : c.status === statusFilter;

      const convTime = new Date(c.createdAt).getTime();
      const matchFrom = !fromDate || convTime >= fromDate;
      const matchTo = !toDate || convTime <= toDate + 86400000;

      return matchQuery && matchProvider && matchStatus && matchFrom && matchTo;
    });
  }

  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();

  let req = supabase
    .from("conversions")
    .select(`
      id,
      user_id,
      provider_id,
      external_transaction_id,
      status,
      gross_amount,
      user_reward,
      currency_code,
      raw_payload,
      confirmed_at,
      rejected_at,
      reversed_at,
      created_at,
      profiles(display_name),
      providers(name, slug)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter !== "all") {
    req = req.eq("status", statusFilter);
  }

  if (fromDate) {
    req = req.gte("created_at", new Date(fromDate).toISOString());
  }

  if (toDate) {
    req = req.lte("created_at", new Date(toDate + 86400000).toISOString());
  }

  const { data: conversions, error } = await req;
  if (error || !conversions) return [];

  // Map and calculate duplicate status
  const txCounts = new Map<string, number>();
  for (const c of conversions) {
    const key = `${c.provider_id}:${c.external_transaction_id}`;
    txCounts.set(key, (txCounts.get(key) || 0) + 1);
  }

  const results: AdminConversionSummary[] = conversions.map((c: any) => {
    const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    const provider = Array.isArray(c.providers) ? c.providers[0] : c.providers;
    const payload = c.raw_payload && typeof c.raw_payload === "object" ? c.raw_payload : {};

    const key = `${c.provider_id}:${c.external_transaction_id}`;
    const isDuplicate = Boolean(payload.is_duplicate || (txCounts.get(key) || 0) > 1);

    const amountUsd = Number(payload.amount_usd || payload.amount || c.gross_amount || 0);

    let conversionType = "Conversión";
    if (payload.sub_type === "screenout_bonus" || payload.status === "screenout") {
      conversionType = "Bonus Screenout";
    } else if (c.status === "reversed") {
      conversionType = "Reversión";
    } else if (provider?.slug === "cpx-research") {
      conversionType = "Encuesta CPX";
    }

    return {
      id: c.id,
      userId: c.user_id,
      userDisplayName: profile?.display_name || c.user_id.slice(0, 8),
      userEmail: `${c.user_id.slice(0, 8)}@usuario.gananza`,
      providerId: c.provider_id,
      providerName: provider?.name || "Proveedor",
      providerSlug: provider?.slug || "general",
      externalTransactionId: c.external_transaction_id,
      conversionType,
      amountUsd,
      payoutAmountLocal: Number(c.gross_amount || 0),
      userRewardLocal: Number(c.user_reward || 0),
      status: c.status,
      isDuplicate,
      createdAt: c.created_at,
      confirmedAt: c.confirmed_at,
      rejectedAt: c.rejected_at,
      reversedAt: c.reversed_at,
    };
  });

  if (!query && providerFilter === "all") return results;

  return results.filter((c) => {
    const matchQuery =
      !query ||
      c.userDisplayName.toLowerCase().includes(query) ||
      c.userEmail.toLowerCase().includes(query) ||
      c.userId.toLowerCase().includes(query) ||
      c.externalTransactionId.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query);

    const matchProvider = providerFilter === "all" ? true : c.providerSlug === providerFilter;
    return matchQuery && matchProvider;
  });
}

export async function getAdminConversionDetail(conversionId: string): Promise<AdminConversionDetail | null> {
  if (!isSupabaseEnabled) {
    const found = DEMO_CONVERSIONS.find((c) => c.id === conversionId);
    return found || DEMO_CONVERSIONS[0];
  }

  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();

  const [{ data: conv }, { data: ledger }] = await Promise.all([
    supabase
      .from("conversions")
      .select(`
        id,
        user_id,
        provider_id,
        offer_id,
        task_session_id,
        external_transaction_id,
        status,
        gross_amount,
        user_reward,
        currency_code,
        raw_payload,
        confirmed_at,
        rejected_at,
        reversed_at,
        created_at,
        profiles(display_name),
        providers(name, slug),
        offers(title)
      `)
      .eq("id", conversionId)
      .maybeSingle(),
    supabase
      .from("ledger_entries")
      .select("id, entry_type, available_delta, pending_delta, description, created_at")
      .eq("conversion_id", conversionId)
      .maybeSingle(),
  ]);

  if (!conv) return null;

  const profile = Array.isArray(conv.profiles) ? conv.profiles[0] : conv.profiles;
  const provider = Array.isArray(conv.providers) ? conv.providers[0] : conv.providers;
  const offer = Array.isArray(conv.offers) ? conv.offers[0] : conv.offers;
  const payload = conv.raw_payload && typeof conv.raw_payload === "object" ? conv.raw_payload : {};

  const amountUsd = Number(payload.amount_usd || payload.amount || conv.gross_amount || 0);

  let conversionType = "Conversión";
  if (payload.sub_type === "screenout_bonus" || payload.status === "screenout") {
    conversionType = "Bonus Screenout";
  } else if (conv.status === "reversed") {
    conversionType = "Reversión";
  } else if (provider?.slug === "cpx-research") {
    conversionType = "Encuesta CPX";
  }

  return {
    id: conv.id,
    userId: conv.user_id,
    userDisplayName: profile?.display_name || conv.user_id.slice(0, 8),
    userEmail: `${conv.user_id.slice(0, 8)}@usuario.gananza`,
    providerId: conv.provider_id,
    providerName: provider?.name || "Proveedor",
    providerSlug: provider?.slug || "general",
    externalTransactionId: conv.external_transaction_id,
    conversionType,
    amountUsd,
    payoutAmountLocal: Number(conv.gross_amount || 0),
    userRewardLocal: Number(conv.user_reward || 0),
    status: conv.status,
    isDuplicate: Boolean(payload.is_duplicate),
    createdAt: conv.created_at,
    confirmedAt: conv.confirmed_at,
    rejectedAt: conv.rejected_at,
    reversedAt: conv.reversed_at,
    offerTitle: offer?.title || "Oferta registrada",
    taskSessionId: conv.task_session_id,
    rawPayload: payload,
    ledgerEntry: ledger
      ? {
          id: ledger.id,
          entryType: ledger.entry_type,
          availableDelta: Number(ledger.available_delta || 0),
          pendingDelta: Number(ledger.pending_delta || 0),
          description: ledger.description,
          createdAt: ledger.created_at,
        }
      : null,
  };
}
