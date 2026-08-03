import { isSupabaseEnabled } from "../env.ts";

export type WithdrawalRulesConfig = {
  id?: string;
  minAmountMercadoPago: number;
  minAmountBankTransfer: number;
  maxActiveRequests: number;
  cooldownDaysAfterPaid: number;
  requireAvailableBalance: boolean;
  updatedAt: string;
  updatedBy?: string | null;
  updatedByName?: string | null;
};

export const DEFAULT_WITHDRAWAL_RULES: WithdrawalRulesConfig = {
  id: "default-rules",
  minAmountMercadoPago: 5000,
  minAmountBankTransfer: 10000,
  maxActiveRequests: 1,
  cooldownDaysAfterPaid: 7,
  requireAvailableBalance: true,
  updatedAt: new Date().toISOString(),
  updatedByName: "Sistema",
};

export type UserWithdrawalEligibility = {
  canWithdraw: boolean;
  minMercadoPago: number;
  minBankTransfer: number;
  cooldownDays: number;
  hasActiveRequest: boolean;
  activeRequestId?: string;
  activeRequestStatus?: string;
  cooldownUntil?: string | null;
  missingForMercadoPago: number;
  missingForBankTransfer: number;
  blockReason?: string | null;
};

// Consultar las reglas configurables de retiro vigentes
export async function getWithdrawalRules(): Promise<WithdrawalRulesConfig> {
  if (!isSupabaseEnabled) {
    return { ...DEFAULT_WITHDRAWAL_RULES };
  }

  try {
    const { createClient } = await import("../supabase/server.ts");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("withdrawal_rule_configs")
      .select("id, min_amount_mercado_pago, min_amount_bank_transfer, max_active_requests, cooldown_days_after_paid, require_available_balance, updated_at, updated_by, profiles(display_name)")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { ...DEFAULT_WITHDRAWAL_RULES };
    }

    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

    return {
      id: data.id,
      minAmountMercadoPago: Number(data.min_amount_mercado_pago),
      minAmountBankTransfer: Number(data.min_amount_bank_transfer),
      maxActiveRequests: Number(data.max_active_requests),
      cooldownDaysAfterPaid: Number(data.cooldown_days_after_paid),
      requireAvailableBalance: Boolean(data.require_available_balance),
      updatedAt: data.updated_at,
      updatedBy: data.updated_by,
      updatedByName: profile?.display_name || "Administrador",
    };
  } catch {
    return { ...DEFAULT_WITHDRAWAL_RULES };
  }
}

// Calcular elegibilidad de retiro para un usuario
export async function getWithdrawalEligibility(
  userId?: string | null,
  availableBalance = 0
): Promise<UserWithdrawalEligibility> {
  const rules = await getWithdrawalRules();
  const missingForMercadoPago = Math.max(0, rules.minAmountMercadoPago - availableBalance);
  const missingForBankTransfer = Math.max(0, rules.minAmountBankTransfer - availableBalance);

  if (!userId || !isSupabaseEnabled) {
    const canWithdraw = availableBalance >= rules.minAmountMercadoPago;
    return {
      canWithdraw,
      minMercadoPago: rules.minAmountMercadoPago,
      minBankTransfer: rules.minAmountBankTransfer,
      cooldownDays: rules.cooldownDaysAfterPaid,
      hasActiveRequest: false,
      missingForMercadoPago,
      missingForBankTransfer,
      blockReason: canWithdraw ? null : `Te faltan $${missingForMercadoPago.toLocaleString("es-AR")} ARS para alcanzar el saldo mínimo.`,
    };
  }

  try {
    const { createClient } = await import("../supabase/server.ts");
    const supabase = await createClient();

    // 1. Verificar si hay solicitudes activas (requested, reviewing, approved)
    const { data: activeRequests } = await supabase
      .from("withdrawals")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", ["requested", "reviewing", "approved"])
      .limit(1);

    if (activeRequests && activeRequests.length > 0) {
      const active = activeRequests[0];
      return {
        canWithdraw: false,
        minMercadoPago: rules.minAmountMercadoPago,
        minBankTransfer: rules.minAmountBankTransfer,
        cooldownDays: rules.cooldownDaysAfterPaid,
        hasActiveRequest: true,
        activeRequestId: active.id,
        activeRequestStatus: active.status,
        missingForMercadoPago,
        missingForBankTransfer,
        blockReason: "Tenés una solicitud de retiro activa en proceso de revisión.",
      };
    }

    // 2. Verificar período de espera (cooldown) desde el último retiro pagado
    if (rules.cooldownDaysAfterPaid > 0) {
      const { data: lastPaid } = await supabase
        .from("withdrawals")
        .select("paid_at, created_at")
        .eq("user_id", userId)
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastPaid) {
        const paidTimestamp = new Date(lastPaid.paid_at || lastPaid.created_at).getTime();
        const cooldownMs = rules.cooldownDaysAfterPaid * 24 * 60 * 60 * 1000;
        const allowedAt = paidTimestamp + cooldownMs;
        const now = Date.now();

        if (now < allowedAt) {
          const cooldownDate = new Date(allowedAt).toISOString();
          const formattedDate = new Intl.DateTimeFormat("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(allowedAt));

          return {
            canWithdraw: false,
            minMercadoPago: rules.minAmountMercadoPago,
            minBankTransfer: rules.minAmountBankTransfer,
            cooldownDays: rules.cooldownDaysAfterPaid,
            hasActiveRequest: false,
            cooldownUntil: cooldownDate,
            missingForMercadoPago,
            missingForBankTransfer,
            blockReason: `Debés esperar ${rules.cooldownDaysAfterPaid} días desde tu último retiro pagado. Podrás volver a solicitar un retiro el ${formattedDate}.`,
          };
        }
      }
    }

    // 3. Verificar saldo suficiente contra el mínimo menor de los métodos
    const minRequired = Math.min(rules.minAmountMercadoPago, rules.minAmountBankTransfer);
    const canWithdraw = availableBalance >= minRequired;

    return {
      canWithdraw,
      minMercadoPago: rules.minAmountMercadoPago,
      minBankTransfer: rules.minAmountBankTransfer,
      cooldownDays: rules.cooldownDaysAfterPaid,
      hasActiveRequest: false,
      missingForMercadoPago,
      missingForBankTransfer,
      blockReason: canWithdraw ? null : `Saldo insuficiente para retirar por cualquier método. Mínimo Mercado Pago: $${rules.minAmountMercadoPago.toLocaleString("es-AR")}.`,
    };
  } catch {
    const canWithdraw = availableBalance >= rules.minAmountMercadoPago;
    return {
      canWithdraw,
      minMercadoPago: rules.minAmountMercadoPago,
      minBankTransfer: rules.minAmountBankTransfer,
      cooldownDays: rules.cooldownDaysAfterPaid,
      hasActiveRequest: false,
      missingForMercadoPago,
      missingForBankTransfer,
    };
  }
}

// Validar solicitud de retiro en el servidor
export async function validateWithdrawalRequest(params: {
  userId: string;
  amount: number;
  methodType: string;
  availableBalance: number;
}): Promise<{ isValid: boolean; error?: string }> {
  const rules = await getWithdrawalRules();

  // Validar mínimo por método
  if (params.methodType === "mercado_pago") {
    if (params.amount < rules.minAmountMercadoPago) {
      return {
        isValid: false,
        error: `El monto mínimo para retiros a Mercado Pago es de $${rules.minAmountMercadoPago.toLocaleString("es-AR")} ARS.`,
      };
    }
  } else {
    if (params.amount < rules.minAmountBankTransfer) {
      return {
        isValid: false,
        error: `El monto mínimo para transferencias a otro banco es de $${rules.minAmountBankTransfer.toLocaleString("es-AR")} ARS.`,
      };
    }
  }

  // Validar saldo disponible
  if (rules.requireAvailableBalance && params.amount > params.availableBalance) {
    return {
      isValid: false,
      error: `Saldo disponible insuficiente. Tenés $${params.availableBalance.toLocaleString("es-AR")} ARS y solicitaste $${params.amount.toLocaleString("es-AR")} ARS.`,
    };
  }

  // Validar elegibilidad (solicitud activa y cooldown de 7 días)
  const eligibility = await getWithdrawalEligibility(params.userId, params.availableBalance);
  if (eligibility.hasActiveRequest) {
    return { isValid: false, error: eligibility.blockReason || "Ya tenés una solicitud de retiro activa." };
  }
  if (eligibility.cooldownUntil) {
    return { isValid: false, error: eligibility.blockReason || "Debés esperar el período de enfriamiento entre retiros." };
  }

  return { isValid: true };
}

export type UpdateWithdrawalRulesResult =
  | { success: true; data: WithdrawalRulesConfig }
  | { success: false; error: string };

// Actualizar reglas de retiro (Solo administradores, con auditoría)
export async function updateWithdrawalRules(params: {
  minMercadoPago: number;
  minBankTransfer: number;
  cooldownDays: number;
  maxActiveRequests: number;
  reason: string;
  userId: string;
  userRoles: string[];
}): Promise<UpdateWithdrawalRulesResult> {
  const isAdmin = params.userRoles.includes("admin");
  if (!isAdmin) {
    return { success: false, error: "Acceso denegado: solo administradores pueden modificar las reglas de retiro." };
  }

  if (typeof params.minMercadoPago !== "number" || params.minMercadoPago <= 0) {
    return { success: false, error: "El mínimo para Mercado Pago debe ser mayor que 0." };
  }
  if (typeof params.minBankTransfer !== "number" || params.minBankTransfer <= 0) {
    return { success: false, error: "El mínimo para transferencia debe ser mayor que 0." };
  }
  if (typeof params.cooldownDays !== "number" || params.cooldownDays < 0) {
    return { success: false, error: "Los días de espera deben ser un número no negativo." };
  }

  const cleanReason = (params.reason || "").trim();
  if (!cleanReason) {
    return { success: false, error: "El motivo de la modificación es obligatorio." };
  }

  const current = await getWithdrawalRules();
  const now = new Date().toISOString();

  if (!isSupabaseEnabled) {
    DEFAULT_WITHDRAWAL_RULES.minAmountMercadoPago = params.minMercadoPago;
    DEFAULT_WITHDRAWAL_RULES.minAmountBankTransfer = params.minBankTransfer;
    DEFAULT_WITHDRAWAL_RULES.cooldownDaysAfterPaid = params.cooldownDays;
    DEFAULT_WITHDRAWAL_RULES.maxActiveRequests = params.maxActiveRequests || 1;
    DEFAULT_WITHDRAWAL_RULES.updatedAt = now;
    return { success: true, data: { ...DEFAULT_WITHDRAWAL_RULES } };
  }

  try {
    const { createClient } = await import("../supabase/server.ts");
    const supabase = await createClient();

    const { data: newConfig, error: insertError } = await supabase
      .from("withdrawal_rule_configs")
      .insert({
        min_amount_mercado_pago: params.minMercadoPago,
        min_amount_bank_transfer: params.minBankTransfer,
        cooldown_days_after_paid: params.cooldownDays,
        max_active_requests: params.maxActiveRequests || 1,
        require_available_balance: true,
        updated_by: params.userId,
      })
      .select("id, min_amount_mercado_pago, min_amount_bank_transfer, max_active_requests, cooldown_days_after_paid, require_available_balance, updated_at, updated_by")
      .single();

    if (insertError || !newConfig) {
      return { success: false, error: insertError?.message || "No pudimos guardar las nuevas reglas." };
    }

    // Registrar en audit_logs
    await supabase.from("audit_logs").insert({
      actor_id: params.userId,
      action: "update_withdrawal_rules",
      entity_type: "withdrawal_rule_config",
      entity_id: newConfig.id,
      before_data: {
        min_amount_mercado_pago: current.minAmountMercadoPago,
        min_amount_bank_transfer: current.minAmountBankTransfer,
        cooldown_days_after_paid: current.cooldownDaysAfterPaid,
        max_active_requests: current.maxActiveRequests,
      },
      after_data: {
        min_amount_mercado_pago: params.minMercadoPago,
        min_amount_bank_transfer: params.minBankTransfer,
        cooldown_days_after_paid: params.cooldownDays,
        max_active_requests: params.maxActiveRequests || 1,
        reason: cleanReason,
      },
    });

    return {
      success: true,
      data: {
        id: newConfig.id,
        minAmountMercadoPago: Number(newConfig.min_amount_mercado_pago),
        minAmountBankTransfer: Number(newConfig.min_amount_bank_transfer),
        maxActiveRequests: Number(newConfig.max_active_requests),
        cooldownDaysAfterPaid: Number(newConfig.cooldown_days_after_paid),
        requireAvailableBalance: Boolean(newConfig.require_available_balance),
        updatedAt: newConfig.updated_at,
        updatedBy: newConfig.updated_by,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar las reglas.",
    };
  }
}
