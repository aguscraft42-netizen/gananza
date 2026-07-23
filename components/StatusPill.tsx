import type { TaskStatus } from "@/lib/demo-data";
import { statusCopy } from "@/lib/demo-data";
import { Icon } from "@/components/Icons";

export function StatusPill({ status }: { status: TaskStatus }) {
  const icon = status === "confirmed" ? "verified" : status === "in_progress" ? "clock" : status === "pending" ? "clock" : status === "rejected" ? "shield" : status === "expired" ? "clock" : "sparkles";
  return <span className={`status-pill status-${status}`}><Icon name={icon} size={12} strokeWidth={2.2}/>{statusCopy[status].label}</span>;
}
