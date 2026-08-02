export type HomeIconName =
  | "home"
  | "wallet"
  | "activity"
  | "tasks"
  | "level"
  | "streak"
  | "secure"
  | "notifications"
  | "rewards"
  | "verified";

const paths: Record<HomeIconName, React.ReactNode> = {
  home: <><path d="m4 11 8-7 8 7"/><path d="M6.5 9.2V20h11V9.2M10 20v-6h4v6"/></>,
  wallet: <><path d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h11"/><path d="M15 12h5v4h-5a2 2 0 0 1 0-4Z"/><circle cx="16" cy="14" r=".6" fill="currentColor" stroke="none"/></>,
  activity: <><path d="M4 18V9M10 18V5M16 18v-7M22 18V3" opacity=".35"/><path d="m3 15 5-5 4 3 8-8"/><path d="M16 5h4v4"/></>,
  tasks: <><rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4V2.5h6V4M8.5 9l1.3 1.3 2.2-2.6M13.5 9H16M8.5 15l1.3 1.3 2.2-2.6M13.5 15H16"/></>,
  level: <><circle cx="12" cy="11" r="7"/><path d="m9.5 17-1 5 3.5-2 3.5 2-1-5"/><path d="m12 7 1.1 2.2 2.4.3-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.3Z"/></>,
  streak: <path d="M13.5 3.5c.7 3-1.2 4.6-2.7 6.2-1.4-1-1.4-2.8-1-4.4C6.3 7.4 5 10.2 5 13a7 7 0 0 0 14 0c0-3.3-1.8-6.3-5.5-9.5ZM12 20c-2 0-3.5-1.5-3.5-3.5 0-1.4.8-2.7 2.2-4 .1 1.2.5 2 1.2 2.5 1-1 1.7-2 1.8-3.3 1.2 1.1 1.8 2.5 1.8 4.1A3.5 3.5 0 0 1 12 20Z"/>,
  secure: <><path d="M12 2.8 4.8 5.6v5.5c0 4.7 2.9 8.8 7.2 10.5 4.3-1.7 7.2-5.8 7.2-10.5V5.6L12 2.8Z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
  notifications: <><path d="M6 16.5h12l-1.5-2.2V10a4.5 4.5 0 0 0-9 0v4.3L6 16.5Z"/><path d="M10 19.5h4"/><circle cx="18.5" cy="5.5" r="2.5" fill="currentColor" stroke="none"/></>,
  rewards: <><circle cx="9" cy="13" r="5"/><circle cx="15" cy="11" r="5"/><path d="M12 5v12M9.8 8.5h3.4a1.5 1.5 0 0 1 0 3h-2.4a1.5 1.5 0 0 0 0 3h3.4"/></>,
  verified: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16.5 8"/></>,
};

export function HomeDashboardIcon({ name, size = 28, className = "" }: { name: HomeIconName; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
