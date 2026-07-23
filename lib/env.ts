const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publicPublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
  appMode: process.env.NEXT_PUBLIC_APP_MODE?.trim() || "demo",
  supabaseUrl: publicUrl || "",
  supabasePublishableKey: publicPublishableKey || "",
};

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabasePublishableKey,
);
export const isSupabaseEnabled =
  isSupabaseConfigured && env.appMode !== "demo";
export const isDemoMode = !isSupabaseEnabled;

export function requirePublicSupabaseEnv() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase no está configurado. Completá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return {
    url: env.supabaseUrl,
    publishableKey: env.supabasePublishableKey,
  };
}
