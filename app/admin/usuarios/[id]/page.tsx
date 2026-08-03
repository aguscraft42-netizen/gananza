import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getAppContext } from "@/lib/gananza/server-data";
import { getAdminUserDetail } from "@/lib/gananza/user-management";
import { UserDetailClient } from "./UserDetailClient";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getAppContext();

  const isStaff = !context.configured || context.roles.some((role) => ["support", "reviewer", "admin"].includes(role));
  const canManage = !context.configured || context.roles.some((role) => ["reviewer", "admin"].includes(role));

  if (!isStaff) redirect("/dashboard");

  const userDetail = await getAdminUserDetail(id);
  if (!userDetail) notFound();

  return (
    <AppShell active="/admin">
      <section className="page-content">
        <UserDetailClient user={userDetail} canManage={canManage} />
      </section>
    </AppShell>
  );
}
