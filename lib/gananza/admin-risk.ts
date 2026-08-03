import { isSupabaseEnabled } from "../env.ts";

export type RiskSignalCode =
  | "rapid_conversions"
  | "reversed_conversions"
  | "early_withdrawal"
  | "near_max_withdrawal"
  | "multiple_rejected_withdrawals"
  | "ledger_inconsistency"
  | "activity_after_suspension"
  | "shared_payout_destination";

export type RiskSignal = {
  code: RiskSignalCode;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  detectedAt: string;
};

export type AdminRiskUser = {
  userId: string;
  displayName: string;
  email: string;
  countryCode: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  isSuspended: boolean;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  createdAt: string;
  lastSignalAt: string;
  signals: RiskSignal[];
};

// Datos Demo para visualización sin Supabase
const DEMO_RISK_USERS: AdminRiskUser[] = [
  {
    userId: "00000000-0000-4000-8000-000000000002",
    displayName: "Nicolás Rodríguez",
    email: "nicolas.rodriguez@demo.com",
    countryCode: "AR",
    riskScore: 78,
    riskLevel: "high",
    isSuspended: true,
    suspendedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    suspensionReason: "Revisión preventiva por múltiples intentos con datos inconsistentes.",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastSignalAt: new Date(Date.now() - 18000000).toISOString(),
    signals: [
      {
        code: "reversed_conversions",
        title: "Conversión revertida o descalificada",
        description: "Se registró 1 reversión de conversión (contracargo de proveedor).",
        severity: "high",
        detectedAt: new Date(Date.now() - 85000000).toISOString(),
      },
      {
        code: "multiple_rejected_withdrawals",
        title: "Múltiples solicitudes de retiro rechazadas",
        description: "El usuario acumula 2 retiros rechazados por discrepancia en datos.",
        severity: "medium",
        detectedAt: new Date(Date.now() - 18000000).toISOString(),
      },
      {
        code: "shared_payout_destination",
        title: "Destino de cobro compartido con otra cuenta",
        description: "El CBU/Alias 'CBU •••• 4410' se encuentra vinculado a 2 cuentas de usuario.",
        severity: "high",
        detectedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },
  {
    userId: "00000000-0000-4000-8000-000000000003",
    displayName: "Joel Pérez",
    email: "joel.perez@demo.com",
    countryCode: "AR",
    riskScore: 55,
    riskLevel: "medium",
    isSuspended: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    lastSignalAt: new Date(Date.now() - 3600000).toISOString(),
    signals: [
      {
        code: "rapid_conversions",
        title: "Alta frecuencia de conversiones",
        description: "Se registraron 6 conversiones en un lapso menor a 1 hora.",
        severity: "medium",
        detectedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        code: "near_max_withdrawal",
        title: "Solicitud de retiro por la casi totalidad del disponible",
        description: "Solicitó un retiro de $8.100 ARS correspondiente al 95% de su saldo disponible.",
        severity: "low",
        detectedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  {
    userId: "00000000-0000-4000-8000-000000000001",
    displayName: "Lucía Martínez",
    email: "lucia.martinez@demo.com",
    countryCode: "AR",
    riskScore: 12,
    riskLevel: "low",
    isSuspended: false,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    lastSignalAt: new Date(Date.now() - 7200000).toISOString(),
    signals: [
      {
        code: "early_withdrawal",
        title: "Primer retiro solicitado dentro de las 24hs de registro",
        description: "Solicitó su primer retiro a las 18 hs de haber creado su cuenta.",
        severity: "low",
        detectedAt: new Date(Date.now() - 58 * 86400000).toISOString(),
      },
    ],
  },
];

export async function getAdminRiskUsers(options?: {
  riskLevel?: "all" | "high" | "medium" | "low";
  signalCode?: string;
  query?: string;
}): Promise<AdminRiskUser[]> {
  const riskLevelFilter = options?.riskLevel || "all";
  const signalCodeFilter = options?.signalCode || "all";
  const query = options?.query?.trim().toLowerCase() || "";

  if (!isSupabaseEnabled) {
    return DEMO_RISK_USERS.filter((u) => {
      const matchQuery =
        !query ||
        u.displayName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.userId.toLowerCase().includes(query);

      const matchLevel = riskLevelFilter === "all" ? true : u.riskLevel === riskLevelFilter;
      const matchSignal =
        signalCodeFilter === "all" ? true : u.signals.some((s) => s.code === signalCodeFilter);

      return matchQuery && matchLevel && matchSignal;
    });
  }

  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();

  const [{ data: profiles }, { data: conversions }, { data: withdrawals }, { data: payoutMethods }, { data: wallets }] =
    await Promise.all([
      supabase.from("profiles").select("id, display_name, country_code, created_at, suspended_at, suspension_reason, risk_score"),
      supabase.from("conversions").select("id, user_id, status, created_at, reversed_at, rejected_at"),
      supabase.from("withdrawals").select("id, user_id, amount, status, created_at"),
      supabase.from("payout_methods").select("user_id, destination_masked, destination"),
      supabase.from("wallets").select("user_id, available_balance, held_balance, debt_balance"),
    ]);

  if (!profiles) return [];

  // Mapear destinos de cobro compartidos
  const destinationUserMap = new Map<string, Set<string>>();
  for (const pm of payoutMethods || []) {
    const dest = (pm.destination || pm.destination_masked || "").trim().toLowerCase();
    if (dest) {
      if (!destinationUserMap.has(dest)) destinationUserMap.set(dest, new Set());
      destinationUserMap.get(dest)!.add(pm.user_id);
    }
  }

  const walletMap = new Map((wallets || []).map((w: any) => [w.user_id, w]));

  const riskUsers: AdminRiskUser[] = [];

  for (const p of profiles) {
    const userId = p.id;
    const userConversions = (conversions || []).filter((c: any) => c.user_id === userId);
    const userWithdrawals = (withdrawals || []).filter((w: any) => w.user_id === userId);
    const userMethods = (payoutMethods || []).filter((pm: any) => pm.user_id === userId);
    const wallet = walletMap.get(userId) || { available_balance: 0, held_balance: 0, debt_balance: 0 };

    const signals: RiskSignal[] = [];
    const createdAtMs = new Date(p.created_at).getTime();
    const suspendedMs = p.suspended_at ? new Date(p.suspended_at).getTime() : null;

    // 1. Muchas conversiones en poco tiempo (>= 5 en menos de 1 hora)
    const sortedConvTimes = userConversions
      .map((c: any) => new Date(c.created_at).getTime())
      .sort((a: number, b: number) => a - b);

    let hasRapid = false;
    for (let i = 0; i < sortedConvTimes.length - 4; i++) {
      if (sortedConvTimes[i + 4] - sortedConvTimes[i] <= 3600000) {
        hasRapid = true;
        break;
      }
    }
    if (hasRapid) {
      signals.push({
        code: "rapid_conversions",
        title: "Alta frecuencia de conversiones",
        description: "Se registraron 5 o más conversiones en un intervalo menor a 1 hora.",
        severity: "medium",
        detectedAt: new Date(sortedConvTimes[sortedConvTimes.length - 1]).toISOString(),
      });
    }

    // 2. Conversiones revertidas o rechazadas
    const reversedOrRejected = userConversions.filter((c: any) => ["reversed", "rejected"].includes(c.status));
    if (reversedOrRejected.length > 0) {
      const latestRev = reversedOrRejected[reversedOrRejected.length - 1];
      signals.push({
        code: "reversed_conversions",
        title: "Conversión revertida o rechazada",
        description: `Se registraron ${reversedOrRejected.length} conversiones en estado revertido/rechazado.`,
        severity: "high",
        detectedAt: latestRev.reversed_at || latestRev.rejected_at || latestRev.created_at,
      });
    }

    // 3. Retiro solicitado poco después del registro (< 24hs)
    const earlyW = userWithdrawals.find((w: any) => new Date(w.created_at).getTime() - createdAtMs <= 86400000);
    if (earlyW) {
      signals.push({
        code: "early_withdrawal",
        title: "Retiro solicitado poco después del registro",
        description: "Se solicitó una extracción en las primeras 24 horas tras la creación de la cuenta.",
        severity: "low",
        detectedAt: earlyW.created_at,
      });
    }

    // 4. Retiro por casi todo el saldo disponible (>= 90%)
    const avail = Number(wallet.available_balance || 0);
    const held = Number(wallet.held_balance || 0);
    const totalAvail = avail + held;
    if (totalAvail > 0) {
      const maxW = userWithdrawals.find((w: any) => Number(w.amount || 0) >= 0.9 * totalAvail);
      if (maxW) {
        signals.push({
          code: "near_max_withdrawal",
          title: "Retiro por casi la totalidad del saldo",
          description: `Solicitud de $${Number(maxW.amount).toLocaleString("es-AR")} ARS correspondiente a más del 90% del saldo disponible acumulado.`,
          severity: "low",
          detectedAt: maxW.created_at,
        });
      }
    }

    // 5. Múltiples retiros rechazados (>= 2)
    const rejectedW = userWithdrawals.filter((w: any) => w.status === "rejected");
    if (rejectedW.length >= 2) {
      signals.push({
        code: "multiple_rejected_withdrawals",
        title: "Múltiples solicitudes de retiro rechazadas",
        description: `El usuario acumula ${rejectedW.length} solicitudes de retiro en estado rechazado.`,
        severity: "medium",
        detectedAt: rejectedW[rejectedW.length - 1].created_at,
      });
    }

    // 6. Inconsistencia en saldo o deuda activa
    const debt = Number(wallet.debt_balance || 0);
    if (debt > 0) {
      signals.push({
        code: "ledger_inconsistency",
        title: "Inconsistencia de saldo o deuda activa",
        description: `La cuenta registra un saldo deudor por reversión no cubierta de $${debt.toLocaleString("es-AR")} ARS.`,
        severity: "high",
        detectedAt: new Date().toISOString(),
      });
    }

    // 7. Cuenta suspendida con actividad posterior
    if (suspendedMs) {
      const postSuspensionConv = userConversions.find((c: any) => new Date(c.created_at).getTime() > suspendedMs);
      const postSuspensionW = userWithdrawals.find((w: any) => new Date(w.created_at).getTime() > suspendedMs);
      if (postSuspensionConv || postSuspensionW) {
        signals.push({
          code: "activity_after_suspension",
          title: "Actividad posterior a la suspensión",
          description: "Se detectó intento de conversión o retiro con fecha posterior a la suspensión de la cuenta.",
          severity: "high",
          detectedAt: postSuspensionW?.created_at || postSuspensionConv?.created_at || new Date().toISOString(),
        });
      }
    }

    // 8. Mismo alias, CVU o CBU usado por varios usuarios
    for (const pm of userMethods) {
      const dest = (pm.destination || pm.destination_masked || "").trim().toLowerCase();
      if (dest && destinationUserMap.has(dest) && destinationUserMap.get(dest)!.size > 1) {
        signals.push({
          code: "shared_payout_destination",
          title: "Destino de cobro compartido",
          description: `El CBU/Alias '${pm.destination_masked || pm.destination}' es utilizado por ${destinationUserMap.get(dest)!.size} cuentas distintas.`,
          severity: "high",
          detectedAt: new Date().toISOString(),
        });
        break;
      }
    }

    if (signals.length > 0) {
      const latestSignal = [...signals].sort(
        (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
      )[0];

      const hasHigh = signals.some((s) => s.severity === "high");
      const hasMed = signals.some((s) => s.severity === "medium");

      const riskLevel: "low" | "medium" | "high" =
        p.risk_score >= 70 || hasHigh || signals.length >= 3
          ? "high"
          : p.risk_score >= 35 || hasMed || signals.length === 2
          ? "medium"
          : "low";

      riskUsers.push({
        userId,
        displayName: p.display_name || userId.slice(0, 8),
        email: `${userId.slice(0, 8)}@usuario.gananza`,
        countryCode: p.country_code || "AR",
        riskScore: Number(p.risk_score || 0),
        riskLevel,
        isSuspended: Boolean(p.suspended_at),
        suspendedAt: p.suspended_at,
        suspensionReason: p.suspension_reason,
        createdAt: p.created_at,
        lastSignalAt: latestSignal.detectedAt,
        signals,
      });
    }
  }

  // Ordenar de mayor a menor riesgo
  riskUsers.sort((a, b) => b.riskScore - a.riskScore || b.signals.length - a.signals.length);

  return riskUsers.filter((u) => {
    const matchQuery =
      !query ||
      u.displayName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.userId.toLowerCase().includes(query);

    const matchLevel = riskLevelFilter === "all" ? true : u.riskLevel === riskLevelFilter;
    const matchSignal =
      signalCodeFilter === "all" ? true : u.signals.some((s) => s.code === signalCodeFilter);

    return matchQuery && matchLevel && matchSignal;
  });
}
