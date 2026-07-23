import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireSecretSupabaseEnv } from "@/lib/server-env";

export function createAdminClient() {
  const { url, secretKey } = requireSecretSupabaseEnv();
  return createSupabaseClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
