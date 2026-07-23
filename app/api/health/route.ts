import { NextResponse } from "next/server";
import { isSupabaseConfigured, isSupabaseEnabled } from "@/lib/env";
import { isSecretKeyConfigured } from "@/lib/server-env";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "gananza",
    version: "0.5.1",
    mode: isSupabaseEnabled ? "supabase" : "demo",
    supabaseConfigured: isSupabaseConfigured,
    supabaseEnabled: isSupabaseEnabled,
    secretKeyConfigured: isSecretKeyConfigured,
    timestamp: new Date().toISOString(),
  });
}
