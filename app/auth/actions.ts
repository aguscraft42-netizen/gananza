"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env, isSupabaseEnabled } from "@/lib/env";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function safeNext(value: string, fallback = "/dashboard") {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function accessError(mode: "login" | "register" | "reset", message: string) {
  const params = new URLSearchParams({ mode, error: message });
  redirect(`/acceso?${params.toString()}`);
}

function authCallbackUrl(next: string) {
  const origin = env.appUrl.replace(/\/+$/, "");
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", safeNext(next));
  return callback.toString();
}

export async function signInAction(formData: FormData) {
  if (!isSupabaseEnabled) redirect("/dashboard");
  const email = field(formData, "email");
  const password = field(formData, "password");
  const next = safeNext(field(formData, "next"));
  if (!email || password.length < 6) accessError("login", "Revisá el correo y la contraseña.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) accessError("login", "No pudimos ingresar con esos datos.");
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  if (!isSupabaseEnabled) redirect("/dashboard");
  const displayName = field(formData, "display_name");
  const email = field(formData, "email");
  const password = field(formData, "password");
  const accepted = formData.get("accepted_terms") === "on";
  if (displayName.length < 2 || !email || password.length < 8 || !accepted) {
    accessError("register", "Completá los datos, usá al menos 8 caracteres y aceptá los términos.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, country_code: "AR" },
      emailRedirectTo: authCallbackUrl("/onboarding"),
    },
  });
  if (error) accessError("register", "No pudimos crear la cuenta. Puede que el correo ya esté registrado.");
  if (data.session) redirect("/onboarding");
  redirect("/acceso?mode=login&check_email=1");
}

export async function requestPasswordResetAction(formData: FormData) {
  if (!isSupabaseEnabled) redirect("/acceso?mode=login&reset_sent=1");
  const email = field(formData, "email");
  if (!email) accessError("reset", "Ingresá un correo válido.");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authCallbackUrl("/auth/actualizar-clave"),
  });
  redirect("/acceso?mode=login&reset_sent=1");
}

export async function updatePasswordAction(formData: FormData) {
  const password = field(formData, "password");
  if (password.length < 8) redirect("/auth/actualizar-clave?error=Usá al menos 8 caracteres.");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/auth/actualizar-clave?error=No pudimos actualizar la contraseña.");
  redirect("/dashboard?password_updated=1");
}

export async function signOutAction() {
  if (isSupabaseEnabled) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/acceso");
}

export async function saveOnboardingAction(formData: FormData) {
  if (!isSupabaseEnabled) redirect("/dashboard");
  const interests = formData.getAll("interests").filter((item): item is string => typeof item === "string");
  const submittedPayoutPreference = field(formData, "payout_preference");
  const payoutPreference = submittedPayoutPreference === "bank_transfer" ? "bank_transfer" : "mercado_pago";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso");
  const { error } = await supabase.from("profiles").update({
    interests,
    payout_preference: payoutPreference,
    onboarding_completed_at: new Date().toISOString(),
  }).eq("id", user.id);
  if (error) redirect("/onboarding?error=No pudimos guardar tus preferencias.");
  redirect("/dashboard?welcome=1");
}
