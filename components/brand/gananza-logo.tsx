import Image from "next/image";

export type GananzaLogoVariant = "symbol" | "logo" | "logo-tagline" | "wordmark";
export type GananzaLogoTheme = "light" | "dark" | "auto";

type Props = {
  variant?: GananzaLogoVariant;
  theme?: GananzaLogoTheme;
  size?: number;
  className?: string;
  priority?: boolean;
};

export function GananzaLogo({
  variant = "logo",
  theme = "auto",
  size = 42,
  className = "",
  priority = false,
}: Props) {
  const symbolSource =
    theme === "light"
      ? "/brand/gananza-symbol-dark.svg"
      : theme === "dark"
        ? "/brand/gananza-symbol-light.svg"
        : "/brand/gananza-symbol.svg";
  const label = variant === "logo-tagline" ? "Gananza. Completá. Sumá. Retirá." : "Gananza";

  if (variant === "wordmark") {
    return <span className={`gananza-brand gananza-brand--wordmark gananza-brand--${theme} ${className}`.trim()} role="img" aria-label={label} style={{ "--brand-size": `${size}px` } as React.CSSProperties}>
      <span className="gananza-wordmark">Gananza</span>
    </span>;
  }

  return <span className={`gananza-brand gananza-brand--${variant} gananza-brand--${theme} ${className}`.trim()} role="img" aria-label={label} style={{ "--brand-size": `${size}px` } as React.CSSProperties}>
    <Image className="gananza-symbol" src={symbolSource} alt="" aria-hidden="true" width={128} height={128} priority={priority} unoptimized />
    {variant !== "symbol" && <span className="gananza-brand-copy">
      <span className="gananza-wordmark">Gananza</span>
      {variant === "logo-tagline" && <span className="gananza-tagline">Completá. Sumá. Retirá.</span>}
    </span>}
  </span>;
}
