"use client";

import { Icon } from "@/components/Icons";
import type { UserWithdrawalEligibility } from "@/lib/gananza/withdrawal-rules";

type WithdrawalRulesSummaryProps = {
  eligibility: UserWithdrawalEligibility;
  availableBalance: number;
};

export function WithdrawalRulesSummary({ eligibility, availableBalance }: WithdrawalRulesSummaryProps) {
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
    <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Alerta si ya existe una solicitud abierta */}
      {eligibility.hasActiveRequest && (
        <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(234, 179, 8, 0.12)", border: "1px solid rgba(234, 179, 8, 0.3)", color: "#fef08a", fontSize: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <Icon name="clock" size={20} />
          <div>
            <strong>Solicitud activa en proceso</strong>
            <p style={{ margin: "2px 0 0 0", color: "#fde047", fontSize: "13px" }}>
              Tenés una solicitud de retiro activa en proceso de revisión. Debés esperar a que se complete antes de enviar otra.
            </p>
          </div>
        </div>
      )}

      {/* Alerta de período de enfriamiento (7 días tras retiro pagado) */}
      {eligibility.cooldownUntil && !eligibility.hasActiveRequest && (
        <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#93c5fd", fontSize: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
          <Icon name="shield" size={20} />
          <div>
            <strong>Período de espera activo ({eligibility.cooldownDays} días)</strong>
            <p style={{ margin: "2px 0 0 0", color: "#bfdbfe", fontSize: "13px" }}>
              Debés esperar {eligibility.cooldownDays} días desde tu último retiro pagado. Podrás volver a solicitar un retiro el <strong>{formattedCooldownDate} hs</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Tarjeta informativa de mínimos por método y monto faltante */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", padding: "16px 20px", borderRadius: "14px", background: "rgba(18, 20, 29, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div>
          <small style={{ color: "#a78bfa", fontSize: "11px", display: "block", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            RETIRO A MERCADO PAGO
          </small>
          <strong style={{ fontSize: "16px", color: "#f8fafc", display: "block", marginTop: "2px" }}>
            Mínimo: ${eligibility.minMercadoPago.toLocaleString("es-AR")} ARS
          </strong>
          <span style={{ fontSize: "12px", color: eligibility.missingForMercadoPago > 0 ? "#fbbf24" : "#4ade80", marginTop: "2px", display: "block" }}>
            {eligibility.missingForMercadoPago > 0
              ? `Te faltan $${eligibility.missingForMercadoPago.toLocaleString("es-AR")} ARS para el mínimo`
              : "✓ Mínimo alcanzado"}
          </span>
        </div>

        <div>
          <small style={{ color: "#60a5fa", fontSize: "11px", display: "block", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            TRANSFERENCIA A OTRO BANCO
          </small>
          <strong style={{ fontSize: "16px", color: "#f8fafc", display: "block", marginTop: "2px" }}>
            Mínimo: ${eligibility.minBankTransfer.toLocaleString("es-AR")} ARS
          </strong>
          <span style={{ fontSize: "12px", color: eligibility.missingForBankTransfer > 0 ? "#fbbf24" : "#4ade80", marginTop: "2px", display: "block" }}>
            {eligibility.missingForBankTransfer > 0
              ? `Te faltan $${eligibility.missingForBankTransfer.toLocaleString("es-AR")} ARS para el mínimo`
              : "✓ Mínimo alcanzado"}
          </span>
        </div>
      </div>
    </div>
  );
}
