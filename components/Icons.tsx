import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Gamepad2,
  House,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Medal,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "home" | "tasks" | "gain" | "wallet" | "profile" | "admin"
  | "search" | "bell" | "trend" | "clock" | "star" | "help"
  | "device" | "check" | "verified" | "shield" | "lock" | "game"
  | "survey" | "app" | "service" | "filter" | "arrow" | "chevron"
  | "withdraw" | "money" | "sparkles" | "medal";

const icons: Record<IconName, LucideIcon> = {
  home: House,
  tasks: ListChecks,
  gain: CircleDollarSign,
  wallet: WalletCards,
  profile: UserRound,
  admin: LayoutDashboard,
  search: Search,
  bell: Bell,
  trend: TrendingUp,
  clock: Clock3,
  star: Star,
  help: CircleHelp,
  device: MonitorSmartphone,
  check: Check,
  verified: BadgeCheck,
  shield: ShieldCheck,
  lock: LockKeyhole,
  game: Gamepad2,
  survey: ListChecks,
  app: Smartphone,
  service: Sparkles,
  filter: SlidersHorizontal,
  arrow: ArrowRight,
  chevron: ChevronRight,
  withdraw: ArrowDownToLine,
  money: Banknote,
  sparkles: Sparkles,
  medal: Medal,
};

export function Icon({
  name,
  className,
  size = 20,
  strokeWidth = 1.9,
}: {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Lucide = icons[name];
  return <Lucide className={className} size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export { CheckCircle2 };
