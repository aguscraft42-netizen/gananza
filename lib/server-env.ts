import "server-only";

import { isSupabaseConfigured, requirePublicSupabaseEnv } from "@/lib/env";

const secretKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  "";

export const serverEnv = {
  supabaseSecretKey: secretKey,
  enableDevTools: process.env.GANANZA_ENABLE_DEV_TOOLS === "true",
  devCallbackSecret: process.env.GANANZA_DEV_CALLBACK_SECRET?.trim() || "",
};

export const isSecretKeyConfigured = Boolean(
  isSupabaseConfigured && serverEnv.supabaseSecretKey,
);

export function requireSecretSupabaseEnv() {
  const publicEnv = requirePublicSupabaseEnv();
  if (!serverEnv.supabaseSecretKey) {
    throw new Error("Falta SUPABASE_SECRET_KEY en el entorno del servidor.");
  }
  return { ...publicEnv, secretKey: serverEnv.supabaseSecretKey };
}
