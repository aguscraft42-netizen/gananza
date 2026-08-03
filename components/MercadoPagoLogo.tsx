import type { CSSProperties } from "react";
import Image from "next/image";

type Props = {
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Official Mercado Pago logo asset with compact white background wrapper for high contrast.
 * Source: https://www.mercadopago.com.ar/mp/logo-oficial
 */
export function MercadoPagoLogo({ compact = false, className = "", style }: Props) {
  return (
    <span
      className={`mercado-pago-logo ${compact ? "compact" : ""} ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: compact ? "4px 8px" : "6px 12px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        ...style,
      }}
      aria-label="Mercado Pago"
      role="img"
    >
      <Image src="/brand/mercado-pago.svg" width={compact ? 88 : 112} height={compact ? 32 : 44} alt="" aria-hidden="true" draggable={false} priority={false} />
    </span>
  );
}
