"use client";

import type { AdminConversionDetail } from "@/lib/gananza/admin-conversions";

type AdminConversionDetailModalProps = {
  conversion: AdminConversionDetail;
  onClose: () => void;
};

export function AdminConversionDetailModal({
  conversion,
  onClose,
}: AdminConversionDetailModalProps) {
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(conversion.createdAt));

  const statusBadge =
    conversion.status === "confirmed"
      ? { label: "CONFIRMADA", color: "#86efac", bg: "rgba(34, 197, 94, 0.15)" }
      : conversion.status === "pending"
      ? { label: "PENDIENTE", color: "#fef08a", bg: "rgba(234, 179, 8, 0.15)" }
      : conversion.status === "reversed"
      ? { label: "REVERTIDA", color: "#fca5a5", bg: "rgba(239, 68, 68, 0.15)" }
      : { label: "RECHAZADA", color: "#cbd5e1", bg: "rgba(148, 163, 184, 0.15)" };

  return (
    <div
      className="modal-backdrop open"
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <article
        style={{
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#12141d",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "20px",
          padding: "24px",
          position: "relative",
          color: "#f8fafc",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: 0,
            color: "#94a3b8",
            fontSize: "20px",
            cursor: "pointer",
          }}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Encabezado */}
        <div style={{ marginBottom: "20px" }}>
          <span className="eyebrow" style={{ color: "#a78bfa", fontWeight: 700, fontSize: "11px" }}>
            DETALLE DE CONVERSIÓN DE PROVEEDOR
          </span>
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "4px 0 2px 0" }}>
            {conversion.providerName} · {conversion.conversionType}
          </h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 800,
                background: statusBadge.bg,
                color: statusBadge.color,
              }}
            >
              {statusBadge.label}
            </span>
            {conversion.isDuplicate && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 800,
                  background: "rgba(249, 115, 22, 0.2)",
                  color: "#fdba74",
                }}
              >
                DUPLICADA / MULTIPLE
              </span>
            )}
            <small style={{ color: "#94a3b8", fontSize: "12px" }}>ID Interno: {conversion.id}</small>
          </div>
        </div>

        {/* Rejilla de información principal */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          {/* Datos del Usuario */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>USUARIO</span>
            <strong style={{ display: "block", fontSize: "15px", color: "#f8fafc", marginTop: "4px" }}>{conversion.userDisplayName}</strong>
            <span style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginTop: "2px" }}>{conversion.userEmail}</span>
            <small style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "4px", wordBreak: "break-all" }}>
              UUID: {conversion.userId}
            </small>
          </div>

          {/* Importes y Valores */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>IMPORTES Y RECOMPENSA</span>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "13px" }}>
              <span style={{ color: "#94a3b8" }}>Importe original USD:</span>
              <strong style={{ color: "#38bdf8" }}>${conversion.amountUsd.toFixed(2)} USD</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "13px" }}>
              <span style={{ color: "#94a3b8" }}>Pago bruto proveedor:</span>
              <strong style={{ color: "#f8fafc" }}>${conversion.payoutAmountLocal.toLocaleString("es-AR")} ARS</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "13px" }}>
              <span style={{ color: "#94a3b8" }}>Acreditado al usuario:</span>
              <strong style={{ color: "#4ade80" }}>${conversion.userRewardLocal.toLocaleString("es-AR")} ARS</strong>
            </div>
          </div>

          {/* Identificación de Transacción */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>TRANSACCIÓN DE PROVEEDOR</span>
            <strong style={{ display: "block", fontSize: "14px", color: "#f8fafc", marginTop: "4px" }}>{conversion.providerName}</strong>
            <span style={{ display: "block", fontSize: "12.5px", color: "#cbd5e1", marginTop: "2px", fontFamily: "monospace" }}>
              Ext. ID: {conversion.externalTransactionId}
            </span>
            <small style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              Fecha: {formattedDate}
            </small>
          </div>

          {/* Movimiento de Ledger Asociado */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>MOVIMIENTO DE LEDGER</span>
            {conversion.ledgerEntry ? (
              <div style={{ marginTop: "6px", fontSize: "12.5px" }}>
                <strong style={{ color: "#4ade80", display: "block" }}>{conversion.ledgerEntry.entryType}</strong>
                <span style={{ color: "#cbd5e1", display: "block", marginTop: "2px" }}>{conversion.ledgerEntry.description}</span>
                <small style={{ color: "#64748b", display: "block", marginTop: "4px" }}>
                  ID Ledger: {conversion.ledgerEntry.id}
                </small>
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "6px 0 0 0" }}>Sin movimiento de ledger vinculado.</p>
            )}
          </div>
        </div>

        {/* Payload completo */}
        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            PAYLOAD RAW RECIBIDO
          </span>
          <pre style={{ margin: 0, padding: "12px", borderRadius: "8px", background: "#080a10", color: "#38bdf8", fontSize: "11.5px", overflowX: "auto", fontFamily: "monospace" }}>
            {JSON.stringify(conversion.rawPayload || {}, null, 2)}
          </pre>
        </div>
      </article>
    </div>
  );
}
