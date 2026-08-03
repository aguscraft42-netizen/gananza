import { isSupabaseEnabled } from "../env.ts";
import { getCurrentExchangeRate } from "./exchange-rate.ts";

export type FinancialMetricsSummary = {
  totalAvailableBalance: number;
  totalPendingBalance: number;
  totalHeldBalance: number;
  totalCurrentObligation: number; // disponible + pendiente + retenido
  totalWithdrawnHistorical: number;
  confirmedConversionsCount: number;
  confirmedConversionsAmount: number;
  pendingConversionsCount: number;
  pendingConversionsAmount: number;
  reversedConversionsCount: number;
  reversedConversionsAmount: number;
  grossProviderRevenue: number;
  userRewardsCredited: number;
  estimatedMarginAmount: number | null;
  estimatedMarginPercentage: number | null;
  fxRateArsUsd: number;
  fxEffectiveAt: string;
};

export type ProviderFinancialBreakdown = {
  providerId: string;
  providerName: string;
  providerSlug: string;
  conversionsCount: number;
  grossRevenue: number;
  userRewards: number;
  marginAmount: number | null;
  marginPercentage: number | null;
};

export type TimeframeFinancials = {
  days: number;
  label: string;
  grossRevenue: number;
  userRewards: number;
  withdrawalsPaid: number;
  conversionsCount: number;
  marginAmount: number | null;
};

export type DailyFinancialTrend = {
  date: string;
  grossRevenue: number;
  userRewards: number;
  withdrawalsPaid: number;
  conversionsCount: number;
};

export type WithdrawalsBreakdown = {
  paidAmount: number;
  paidCount: number;
  pendingAmount: number;
  pendingCount: number;
  rejectedAmount: number;
  rejectedCount: number;
};

export type FullFinancialData = {
  summary: FinancialMetricsSummary;
  providerBreakdown: ProviderFinancialBreakdown[];
  timeframes: TimeframeFinancials[];
  dailyTrends: DailyFinancialTrend[];
  withdrawalsSummary: WithdrawalsBreakdown[];
};

// Datos Demo para visualización sin Supabase
const DEMO_FINANCIALS: FullFinancialData = {
  summary: {
    totalAvailableBalance: 125000,
    totalPendingBalance: 24000,
    totalHeldBalance: 50000,
    totalCurrentObligation: 199000, // 125000 + 24000 + 50000
    totalWithdrawnHistorical: 185000,
    confirmedConversionsCount: 142,
    confirmedConversionsAmount: 310000,
    pendingConversionsCount: 12,
    pendingConversionsAmount: 24000,
    reversedConversionsCount: 3,
    reversedConversionsAmount: 7500,
    grossProviderRevenue: 480000,
    userRewardsCredited: 310000,
    estimatedMarginAmount: 170000,
    estimatedMarginPercentage: 35.4,
    fxRateArsUsd: 1250.0,
    fxEffectiveAt: new Date().toISOString(),
  },
  providerBreakdown: [
    {
      providerId: "prov-cpx",
      providerName: "CPX Research",
      providerSlug: "cpx-research",
      conversionsCount: 110,
      grossRevenue: 380000,
      userRewards: 245000,
      marginAmount: 135000,
      marginPercentage: 35.5,
    },
    {
      providerId: "prov-theorem",
      providerName: "TheoremReach",
      providerSlug: "theoremreach",
      conversionsCount: 32,
      grossRevenue: 100000,
      userRewards: 65000,
      marginAmount: 35000,
      marginPercentage: 35.0,
    },
  ],
  timeframes: [
    { days: 7, label: "Últimos 7 días", grossRevenue: 95000, userRewards: 62000, withdrawalsPaid: 45000, conversionsCount: 28, marginAmount: 33000 },
    { days: 30, label: "Últimos 30 días", grossRevenue: 280000, userRewards: 182000, withdrawalsPaid: 120000, conversionsCount: 84, marginAmount: 98000 },
    { days: 90, label: "Últimos 90 días", grossRevenue: 480000, userRewards: 310000, withdrawalsPaid: 185000, conversionsCount: 142, marginAmount: 170000 },
  ],
  dailyTrends: [
    { date: "03 Aug", grossRevenue: 18000, userRewards: 11500, withdrawalsPaid: 8000, conversionsCount: 5 },
    { date: "02 Aug", grossRevenue: 22000, userRewards: 14200, withdrawalsPaid: 12000, conversionsCount: 7 },
    { date: "01 Aug", grossRevenue: 15000, userRewards: 9800, withdrawalsPaid: 5000, conversionsCount: 4 },
    { date: "31 Jul", grossRevenue: 19000, userRewards: 12400, withdrawalsPaid: 10000, conversionsCount: 6 },
    { date: "30 Jul", grossRevenue: 21000, userRewards: 13600, withdrawalsPaid: 7000, conversionsCount: 6 },
  ],
  withdrawalsSummary: [
    { paidAmount: 185000, paidCount: 24, pendingAmount: 50000, pendingCount: 8, rejectedAmount: 12000, rejectedCount: 3 },
  ],
};

export async function getAdminFinancials(): Promise<FullFinancialData> {
  const fxConfig = await getCurrentExchangeRate();

  if (!isSupabaseEnabled) {
    return {
      ...DEMO_FINANCIALS,
      summary: {
        ...DEMO_FINANCIALS.summary,
        fxRateArsUsd: fxConfig.fxRateArsUsd,
        fxEffectiveAt: fxConfig.fxEffectiveAt,
      },
    };
  }

  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();

  const [{ data: wallets }, { data: conversions }, { data: withdrawals }, { data: providers }] = await Promise.all([
    supabase.from("wallets").select("available_balance, pending_balance, held_balance, withdrawn_balance"),
    supabase.from("conversions").select("id, provider_id, status, gross_amount, user_reward, created_at, providers(id, name, slug)"),
    supabase.from("withdrawals").select("id, amount, status, created_at, paid_at"),
    supabase.from("providers").select("id, name, slug"),
  ]);

  let totalAvailable = 0;
  let totalPending = 0;
  let totalHeld = 0;
  let totalWithdrawn = 0;

  for (const w of wallets || []) {
    totalAvailable += Number(w.available_balance || 0);
    totalPending += Number(w.pending_balance || 0);
    totalHeld += Number(w.held_balance || 0);
    totalWithdrawn += Number(w.withdrawn_balance || 0);
  }

  const totalCurrentObligation = totalAvailable + totalPending + totalHeld;

  let confirmedCount = 0;
  let confirmedAmount = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  let reversedCount = 0;
  let reversedAmount = 0;
  let grossRevenue = 0;
  let userRewards = 0;

  const providerMap = new Map<string, { id: string; name: string; slug: string; count: number; gross: number; rewards: number }>();
  for (const p of providers || []) {
    providerMap.set(p.id, { id: p.id, name: p.name, slug: p.slug, count: 0, gross: 0, rewards: 0 });
  }

  const nowMs = Date.now();
  const timeframesMap = {
    7: { days: 7, label: "Últimos 7 días", grossRevenue: 0, userRewards: 0, withdrawalsPaid: 0, conversionsCount: 0, marginAmount: null as number | null },
    30: { days: 30, label: "Últimos 30 días", grossRevenue: 0, userRewards: 0, withdrawalsPaid: 0, conversionsCount: 0, marginAmount: null as number | null },
    90: { days: 90, label: "Últimos 90 días", grossRevenue: 0, userRewards: 0, withdrawalsPaid: 0, conversionsCount: 0, marginAmount: null as number | null },
  };

  const dailyTrendMap = new Map<string, { date: string; grossRevenue: number; userRewards: number; withdrawalsPaid: number; conversionsCount: number }>();

  for (const c of conversions || []) {
    const gross = Number(c.gross_amount || 0);
    const reward = Number(c.user_reward || 0);
    const createdMs = new Date(c.created_at).getTime();
    const dateKey = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(c.created_at));

    if (!dailyTrendMap.has(dateKey)) {
      dailyTrendMap.set(dateKey, { date: dateKey, grossRevenue: 0, userRewards: 0, withdrawalsPaid: 0, conversionsCount: 0 });
    }
    const dayStat = dailyTrendMap.get(dateKey)!;

    if (c.status === "confirmed") {
      confirmedCount++;
      confirmedAmount += reward;
      grossRevenue += gross;
      userRewards += reward;
      dayStat.grossRevenue += gross;
      dayStat.userRewards += reward;
      dayStat.conversionsCount++;

      const pStat = providerMap.get(c.provider_id);
      if (pStat) {
        pStat.count++;
        pStat.gross += gross;
        pStat.rewards += reward;
      }

      const diffDays = (nowMs - createdMs) / 86400000;
      if (diffDays <= 7) {
        timeframesMap[7].grossRevenue += gross;
        timeframesMap[7].userRewards += reward;
        timeframesMap[7].conversionsCount++;
      }
      if (diffDays <= 30) {
        timeframesMap[30].grossRevenue += gross;
        timeframesMap[30].userRewards += reward;
        timeframesMap[30].conversionsCount++;
      }
      if (diffDays <= 90) {
        timeframesMap[90].grossRevenue += gross;
        timeframesMap[90].userRewards += reward;
        timeframesMap[90].conversionsCount++;
      }
    } else if (c.status === "pending") {
      pendingCount++;
      pendingAmount += reward;
    } else if (c.status === "reversed") {
      reversedCount++;
      reversedAmount += reward;
    }
  }

  let paidWithdrawalsAmount = 0;
  let paidWithdrawalsCount = 0;
  let pendingWithdrawalsAmount = 0;
  let pendingWithdrawalsCount = 0;
  let rejectedWithdrawalsAmount = 0;
  let rejectedWithdrawalsCount = 0;

  for (const w of withdrawals || []) {
    const amt = Number(w.amount || 0);
    const createdMs = new Date(w.created_at).getTime();
    const diffDays = (nowMs - createdMs) / 86400000;

    if (w.status === "paid") {
      paidWithdrawalsAmount += amt;
      paidWithdrawalsCount++;
      if (diffDays <= 7) timeframesMap[7].withdrawalsPaid += amt;
      if (diffDays <= 30) timeframesMap[30].withdrawalsPaid += amt;
      if (diffDays <= 90) timeframesMap[90].withdrawalsPaid += amt;
    } else if (["requested", "reviewing", "approved"].includes(w.status)) {
      pendingWithdrawalsAmount += amt;
      pendingWithdrawalsCount++;
    } else if (w.status === "rejected") {
      rejectedWithdrawalsAmount += amt;
      rejectedWithdrawalsCount++;
    }
  }

  // Margen estimado general (solo cuando existan ingresos brutos registrados)
  const marginAmount = grossRevenue > 0 ? grossRevenue - userRewards : null;
  const marginPercentage = grossRevenue > 0 ? ((grossRevenue - userRewards) / grossRevenue) * 100 : null;

  const providerBreakdownList: ProviderFinancialBreakdown[] = Array.from(providerMap.values()).map((p) => {
    const pMargin = p.gross > 0 ? p.gross - p.rewards : null;
    const pMarginPct = p.gross > 0 ? ((p.gross - p.rewards) / p.gross) * 100 : null;
    return {
      providerId: p.id,
      providerName: p.name,
      providerSlug: p.slug,
      conversionsCount: p.count,
      grossRevenue: p.gross,
      userRewards: p.rewards,
      marginAmount: pMargin,
      marginPercentage: pMarginPct,
    };
  });

  const timeframesList: TimeframeFinancials[] = Object.values(timeframesMap).map((tf) => ({
    ...tf,
    marginAmount: tf.grossRevenue > 0 ? tf.grossRevenue - tf.userRewards : null,
  }));

  return {
    summary: {
      totalAvailableBalance: totalAvailable,
      totalPendingBalance: totalPending,
      totalHeldBalance: totalHeld,
      totalCurrentObligation,
      totalWithdrawnHistorical: totalWithdrawn || paidWithdrawalsAmount,
      confirmedConversionsCount: confirmedCount,
      confirmedConversionsAmount: confirmedAmount,
      pendingConversionsCount: pendingCount,
      pendingConversionsAmount: pendingAmount,
      reversedConversionsCount: reversedCount,
      reversedConversionsAmount: reversedAmount,
      grossProviderRevenue: grossRevenue,
      userRewardsCredited: userRewards,
      estimatedMarginAmount: marginAmount,
      estimatedMarginPercentage: marginPercentage,
      fxRateArsUsd: fxConfig.fxRateArsUsd,
      fxEffectiveAt: fxConfig.fxEffectiveAt,
    },
    providerBreakdown: providerBreakdownList,
    timeframes: timeframesList,
    dailyTrends: Array.from(dailyTrendMap.values()).slice(0, 14),
    withdrawalsSummary: [
      {
        paidAmount: paidWithdrawalsAmount,
        paidCount: paidWithdrawalsCount,
        pendingAmount: pendingWithdrawalsAmount,
        pendingCount: pendingWithdrawalsCount,
        rejectedAmount: rejectedWithdrawalsAmount,
        rejectedCount: rejectedWithdrawalsCount,
      },
    ],
  };
}
