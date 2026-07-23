import type { CSSProperties } from "react";

type Props = {
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Compact in-app rendering of the Mercado Pago brand mark.
 * The logo is shown only to identify the external withdrawal destination.
 */
export function MercadoPagoLogo({ compact = false, className = "", style }: Props) {
  return (
    <span
      className={`mercado-pago-logo ${compact ? "compact" : ""} ${className}`.trim()}
      style={style}
      aria-label="Mercado Pago"
      role="img"
    >
      <svg viewBox="0 0 72 48" aria-hidden="true" focusable="false">
        <ellipse cx="36" cy="24" rx="34" ry="21" fill="#00a8e8" />
        <g>
          <path d="M-3 12c12 7 24 8 34 1 3-2 7-2 10 0l7 5c8 5 16 5 27-2v20c-13 8-25 8-37 0l-5-3-5 3c-11 7-21 7-31 1z" fill="#fff" />
          <path d="M-2 8c15 10 27 10 39 1 12 9 24 9 38-1V-2H-2z" fill="#22b9ef" />
          <path d="M-2 37c12-8 23-9 34-2 2 1 5 1 7 0 12-7 24-6 36 2v14H-2z" fill="#22b9ef" />
          <g fill="#fff" stroke="#2d3277" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 23c2-2 5-2 7 0l2 2 8-8c2-2 5-2 7 0l12 10c2 2 2 5 0 7-2 2-5 2-7 0l-2-2" />
            <path d="M24 25l14 11c2 2 5 1 6-1" />
            <path d="M20 27l13 11c2 1 4 1 6-1" />
            <path d="M18 29l9 8c2 2 5 2 7 0" />
            <path d="M16 23l-4 3c-2 2-2 5 0 7 2 2 5 2 7 0l2-2" />
          </g>
        </g>
        <ellipse cx="36" cy="24" rx="34" ry="21" fill="none" stroke="#2d3277" strokeWidth="2.2" />
      </svg>
      {!compact && (
        <span className="mercado-pago-wordmark" aria-hidden="true">
          <strong>mercado</strong>
          <strong>pago</strong>
        </span>
      )}
    </span>
  );
}
