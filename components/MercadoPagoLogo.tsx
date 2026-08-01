import type { CSSProperties } from "react";
import Image from "next/image";

type Props = {
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Official Mercado Pago logo asset used only to identify the selected payout destination.
 * Source: https://www.mercadopago.com.ar/mp/logo-oficial
 */
export function MercadoPagoLogo({ compact = false, className = "", style }: Props) {
  return (
    <span
      className={`mercado-pago-logo ${compact ? "compact" : ""} ${className}`.trim()}
      style={style}
      aria-label="Mercado Pago"
      role="img"
    >
      <Image src="/brand/mercado-pago.svg" width={118} height={48} alt="" aria-hidden="true" draggable={false} priority={false} />
    </span>
  );
}
