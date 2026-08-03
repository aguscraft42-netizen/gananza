import { isSupabaseEnabled } from "../env.ts";

export type ExchangeRateConfig = {
  id?: string;
  baseCurrency: string;
  targetCurrency: string;
  fxRateArsUsd: number;
  fxSource: string;
  fxEffectiveAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  updatedByName?: string | null;
};

export type ExchangeRateAuditLog = {
  id: string | number;
  actorId?: string;
  action: string;
  beforeRate: number;
  newRate: number;
  source: string;
  reason: string;
  createdAt: string;
};

export const DEFAULT_EXCHANGE_RATE: ExchangeRateConfig = {
  id: "default-config",
  baseCurrency: "USD",
  targetCurrency: "ARS",
  fxRateArsUsd: 1250.0,
  fxSource: "Manual Admin",
  fxEffectiveAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updatedByName: "Sistema",
};

// Función server-side reutilizable para consultar la cotización ARS/USD vigente
export async function getCurrentExchangeRate(): Promise<ExchangeRateConfig> {
  if (!isSupabaseEnabled) {
    return { ...DEFAULT_EXCHANGE_RATE };
  }

  try {
    const { createClient } = await import("../supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exchange_rate_configs")
      .select("id, base_currency, target_currency, fx_rate_ars_usd, fx_source, fx_effective_at, updated_at, updated_by, profiles(display_name)")
      .eq("base_currency", "USD")
      .eq("target_currency", "ARS")
      .order("fx_effective_at", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { ...DEFAULT_EXCHANGE_RATE };
    }

    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;

    return {
      id: data.id,
      baseCurrency: data.base_currency,
      targetCurrency: data.target_currency,
      fxRateArsUsd: Number(data.fx_rate_ars_usd),
      fxSource: data.fx_source,
      fxEffectiveAt: data.fx_effective_at,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by,
      updatedByName: profile?.display_name || "Administrador",
    };
  } catch {
    return { ...DEFAULT_EXCHANGE_RATE };
  }
}

export type UpdateExchangeRateResult =
  | { success: true; data: ExchangeRateConfig }
  | { success: false; error: string };

// Actualizar cotización manual con validaciones y auditoría
export async function updateExchangeRate(params: {
  rate: number;
  source?: string;
  reason: string;
  userId: string;
  userRoles: string[];
}): Promise<UpdateExchangeRateResult> {
  // 1. Validar permisos de administrador
  const isAdmin = params.userRoles.includes("admin");
  if (!isAdmin) {
    return { success: false, error: "Acceso denegado: solo administradores pueden modificar la cotización." };
  }

  // 2. Validar valor numérico de la cotización
  if (typeof params.rate !== "number" || Number.isNaN(params.rate) || !Number.isFinite(params.rate) || params.rate <= 0) {
    return { success: false, error: "La cotización debe ser un número mayor que 0." };
  }

  if (params.rate > 1000000) {
    return { success: false, error: "La cotización ingresada supera el límite máximo permitido." };
  }

  // 3. Validar motivo obligatorio
  const cleanReason = (params.reason || "").trim();
  if (!cleanReason) {
    return { success: false, error: "El motivo del cambio es obligatorio." };
  }

  const cleanSource = (params.source || "Manual Admin").trim();
  const current = await getCurrentExchangeRate();
  const now = new Date().toISOString();

  if (!isSupabaseEnabled) {
    DEFAULT_EXCHANGE_RATE.fxRateArsUsd = params.rate;
    DEFAULT_EXCHANGE_RATE.fxSource = cleanSource;
    DEFAULT_EXCHANGE_RATE.fxEffectiveAt = now;
    DEFAULT_EXCHANGE_RATE.updatedAt = now;
    return { success: true, data: { ...DEFAULT_EXCHANGE_RATE } };
  }

  try {
    const { createClient } = await import("../supabase/server");
    const supabase = await createClient();

    // Insertar nueva configuración de tipo de cambio
    const { data: newConfig, error: insertError } = await supabase
      .from("exchange_rate_configs")
      .insert({
        base_currency: "USD",
        target_currency: "ARS",
        fx_rate_ars_usd: params.rate,
        fx_source: cleanSource,
        fx_effective_at: now,
        updated_by: params.userId,
      })
      .select("id, base_currency, target_currency, fx_rate_ars_usd, fx_source, fx_effective_at, updated_at, updated_by")
      .single();

    if (insertError || !newConfig) {
      return { success: false, error: insertError?.message || "No pudimos guardar la cotización." };
    }

    // Registrar evento en audit_logs
    await supabase.from("audit_logs").insert({
      actor_id: params.userId,
      action: "update_exchange_rate",
      entity_type: "exchange_rate_config",
      entity_id: newConfig.id,
      before_data: {
        fx_rate_ars_usd: current.fxRateArsUsd,
        fx_source: current.fxSource,
      },
      after_data: {
        fx_rate_ars_usd: params.rate,
        fx_source: cleanSource,
        reason: cleanReason,
      },
    });

    return {
      success: true,
      data: {
        id: newConfig.id,
        baseCurrency: newConfig.base_currency,
        targetCurrency: newConfig.target_currency,
        fxRateArsUsd: Number(newConfig.fx_rate_ars_usd),
        fxSource: newConfig.fx_source,
        fxEffectiveAt: newConfig.fx_effective_at,
        updatedAt: newConfig.updated_at,
        updatedBy: newConfig.updated_by,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al guardar la cotización.",
    };
  }
}
