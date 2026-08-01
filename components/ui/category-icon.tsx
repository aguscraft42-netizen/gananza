import type { CSSProperties } from "react";
import Image from "next/image";

type CategoryIconType = "games" | "surveys" | "apps-services" | "quick-tasks" | "other-bank";

const iconPath: Record<CategoryIconType, string> = {
  games: "/icons/categories/games.svg",
  surveys: "/icons/categories/surveys.svg",
  "apps-services": "/icons/categories/apps-services.svg",
  "quick-tasks": "/icons/categories/quick-tasks.svg",
  "other-bank": "/icons/payments/other-bank.svg",
};

const iconLabel: Record<CategoryIconType, string> = {
  games: "Juegos",
  surveys: "Encuestas",
  "apps-services": "Apps y servicios",
  "quick-tasks": "Tareas rapidas",
  "other-bank": "Transferencia a otro banco",
};

export function CategoryIcon({
  type,
  size = 40,
  selected = false,
  className = "",
}: {
  type: CategoryIconType;
  size?: 24 | 32 | 40 | 48 | number;
  selected?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`category-icon ${selected ? "selected" : ""} ${className}`.trim()}
      style={{ "--icon-size": `${size}px` } as CSSProperties}
    >
      <Image src={iconPath[type]} width={size} height={size} alt="" aria-hidden="true" draggable={false} />
      <span className="sr-only">{iconLabel[type]}</span>
    </span>
  );
}

export type { CategoryIconType };
