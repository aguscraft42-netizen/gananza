import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { OnboardingForm } from "@/components/OnboardingForm";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseEnabled } from "@/lib/env";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function OnboardingPage({ searchParams }: Props) {
  if (!isSupabaseEnabled) redirect("/dashboard");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso");
  const { error } = await searchParams;
  return <main className="auth-page"><div className="auth-brand"><Logo/></div><section className="auth-layout single-auth"><OnboardingForm error={error}/></section></main>;
}
