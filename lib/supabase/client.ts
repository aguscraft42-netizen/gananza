"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  const { url, publishableKey } = requirePublicSupabaseEnv();
  if (!browserClient) browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
