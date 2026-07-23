import Link from "next/link";
import { redirect } from "next/navigation";
import { updatePasswordAction } from "@/app/auth/actions";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/acceso?mode=reset");
  const { error } = await searchParams;
  return <main className="auth-page"><div className="auth-brand"><Logo/><Link href="/" className="text-button">← Volver</Link></div><section className="auth-layout single-auth"><div className="auth-card"><span className="eyebrow">SEGURIDAD</span><h1>Creá una contraseña nueva.</h1><p>Usá al menos ocho caracteres y evitá reutilizar una clave de otro servicio.</p>{error && <div className="auth-message error">{error}</div>}<form action={updatePasswordAction} className="auth-form"><label>Nueva contraseña<input name="password" required minLength={8} type="password" autoComplete="new-password"/></label><button className="primary-button button-wide" type="submit">Actualizar contraseña</button></form></div></section></main>;
}
