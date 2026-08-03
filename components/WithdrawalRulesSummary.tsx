"use client";

import { Icon } from "@/components/Icons";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { UserWithdrawalEligibility } from "@/lib/gananza/withdrawal-rules";

type WithdrawalRulesSummaryProps = {
  eligibility: UserWithdrawalEligibility;
  availableBalance?: number;
};

export function WithdrawalRulesSummary({ eligibility }: WithdrawalRulesSummaryProps) {
  const formattedCooldownDate = eligibility.cooldownUntil
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(eligibility.cooldownUntil))
    : null;

  return (
    <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Alerta si ya existe una solicitud abierta */}
      {eligibility.hasActiveRequest && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            background: "rgba(0, 200, 111, 0.08)",
            border: "1px solid rgba(0, 200, 111, 0.25)",
            color: "var(--text)",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Icon name="clock" size={20} />
          <div>
            <strong style={{ color: "var(--green-2)" }}>Solicitud activa en proceso</strong>
            <p style={{ margin: "2px 0 0 0", color: "var(--text-soft)", fontSize: "13px" }}>
              Tenés una solicitud de retiro activa en proceso de revisión. Debés esperar a que se complete antes de enviar otra.
            </p>
          </div>
        </div>
      )}

      {/* Alerta de período de enfriamiento (7 días tras retiro pagado) */}
      {eligibility.cooldownUntil && !eligibility.hasActiveRequest && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            background: "rgba(0, 200, 111, 0.08)",
            border: "1px solid rgba(0, 200, 111, 0.25)",
            color: "var(--text)",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Icon name="shield" size={20} />
          <div>
            <strong style={{ color: "var(--green-2)" }}>Período de espera activo ({eligibility.cooldownDays} días)</strong>
            <p style={{ margin: "2px 0 0 0", color: "var(--text-soft)", fontSize: "13px" }}>
              Debés esperar {eligibility.cooldownDays} días desde tu último retiro pagado. Podrás volver a solicitar un retiro el <strong>{formattedCooldownDate} hs</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta informativa de mínimos unificada en Verde Esmeralda de Gananza */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          padding: "20px",
          borderRadius: "18px",
          background: "rgba(0, 200, 111, 0.04)",
          border: "1px solid rgba(0, 200, 111, 0.18)",
        }}
      >
        {/* Método Mercado Pago */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(0, 200, 111, 0.1)",
              border: "1px solid rgba(0, 200, 111, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MercadoPagoLogo compact />
          </div>
          <div>
            <small
              style={{
                color: "var(--green)",
                fontSize: "11px",
                display: "block",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              RETIRO A MERCADO PAGO
            </small>
            <strong style={{ fontSize: "17px", color: "var(--text)", display: "block", marginTop: "3px", fontWeight: 700 }}>
              Mínimo: <span style={{ color: "var(--green-2)" }}>${eligibility.minMercadoPago.toLocaleString("es-AR")} ARS</span>
            </strong>
            <span
              style={{
                fontSize: "12.5px",
                color: "var(--green-2)",
                opacity: 0.9,
                marginTop: "4px",
                display: "block",
                fontWeight: 500,
              }}
            >
              {eligibility.missingForMercadoPago > 0
                ? `Te faltan $${eligibility.missingForMercadoPago.toLocaleString("es-AR")} ARS para el mínimo`
                : "✓ Mínimo alcanzado"}
            </span>
          </div>
        </div>

        {/* Método Transferencia a otro banco */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div
            style={{
              padding: "8px 10px",
              borderRadius: "12px",
              background: "rgba(0, 200, 111, 0.1)",
              border: "1px solid rgba(0, 200, 111, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--green)",
            }}
          >
            <CategoryIcon type="other-bank" size={24} />
          </div>
          <div>
            <small
              style={{
                color: "var(--green)",
                fontSize: "11px",
                display: "block",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              TRANSFERENCIA A OTRO BANCO
            </small>
            <strong style={{ fontSize: "17px", color: "var(--text)", display: "block", marginTop: "3px", fontWeight: 700 }}>
              Mínimo: <span style={{ color: "var(--green-2)" }}>${eligibility.minBankTransfer.toLocaleString("es-AR")} ARS</span>
            </strong>
            <span
              style={{
                fontSize: "12.5px",
                color: "var(--green-2)",
                opacity: 0.9,
                marginTop: "4px",
                display: "block",
                fontWeight: 500,
              }}
            >
              {eligibility.missingForBankTransfer > 0
                ? `Te faltan $${eligibility.missingForBankTransfer.toLocaleString("es-AR")} ARS para el mínimo`
                : "✓ Mínimo alcanzado"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
