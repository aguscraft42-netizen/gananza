"use client";

import { useState } from "react";
import { AdminConversionDetailModal } from "@/components/AdminConversionDetailModal";
import type { AdminConversionDetail } from "@/lib/gananza/admin-conversions";

type Props = {
  conversions: AdminConversionDetail[];
};

export function ConversionsClient({ conversions }: Props) {
  const [selectedConversion, setSelectedConversion] = useState<AdminConversionDetail | null>(null);

  return (
    <>
      <div className="admin-table" style={{ overflowX: "auto" }}>
        <div
          className="admin-row head"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.9fr 1.1fr 1fr 0.8fr 1fr 0.9fr 0.7fr",
            gap: "10px",
            padding: "12px 10px",
            fontSize: "11px",
          }}
        >
          <span>Usuario</span>
          <span>Proveedor</span>
          <span>ID Externo</span>
          <span>Tipo</span>
          <span>USD Original</span>
          <span>Importe Local</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {conversions.map((item) => {
          const formattedDate = new Intl.DateTimeFormat("es-AR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(item.createdAt));

          const statusBadge =
            item.status === "confirmed"
              ? { label: "CONFIRMADA", color: "#86efac", bg: "rgba(34, 197, 94, 0.15)" }
              : item.status === "pending"
              ? { label: "PENDIENTE", color: "#fef08a", bg: "rgba(234, 179, 8, 0.15)" }
              : item.status === "reversed"
              ? { label: "REVERTIDA", color: "#fca5a5", bg: "rgba(239, 68, 68, 0.15)" }
              : { label: "RECHAZADA", color: "#cbd5e1", bg: "rgba(148, 163, 184, 0.15)" };

          return (
            <div
              className="admin-row"
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.9fr 1.1fr 1fr 0.8fr 1fr 0.9fr 0.7fr",
                gap: "10px",
                alignItems: "center",
                padding: "12px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: "12.5px",
              }}
            >
              <div>
                <strong style={{ display: "block", color: "#f8fafc" }}>{item.userDisplayName}</strong>
                <small style={{ color: "#94a3b8", fontSize: "11px" }}>{item.userEmail}</small>
              </div>

              <div>
                <strong style={{ color: "#cbd5e1", fontSize: "12px", display: "block" }}>{item.providerName}</strong>
                <small style={{ color: "#64748b", fontSize: "10px" }}>{item.providerSlug}</small>
              </div>

              <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#94a3b8" }}>
                {item.externalTransactionId}
              </span>

              <span>{item.conversionType}</span>

              <strong style={{ color: "#38bdf8" }}>${item.amountUsd.toFixed(2)} USD</strong>

              <div>
                <strong style={{ color: "#4ade80", fontSize: "12px", display: "block" }}>
                  ${item.userRewardLocal.toLocaleString("es-AR")} ARS
                </strong>
                <small style={{ color: "#64748b", fontSize: "10px" }}>
                  Bruto: ${item.payoutAmountLocal.toLocaleString("es-AR")}
                </small>
              </div>

              <div>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 800,
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    display: "inline-block",
                  }}
                >
                  {statusBadge.label}
                </span>
                {item.isDuplicate && (
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "999px",
                      fontSize: "9px",
                      fontWeight: 800,
                      background: "rgba(249, 115, 22, 0.2)",
                      color: "#fdba74",
                      display: "block",
                      marginTop: "3px",
                      width: "fit-content",
                    }}
                  >
                    DUPLICADA
                  </span>
                )}
                <small style={{ display: "block", color: "#64748b", fontSize: "10px", marginTop: "2px" }}>
                  {formattedDate}
                </small>
              </div>

              <div>
                <button
                  type="button"
                  className="primary-button"
                  style={{ padding: "4px 10px", fontSize: "11px", minHeight: "28px" }}
                  onClick={() => setSelectedConversion(item)}
                >
                  Ver detalle
                </button>
              </div>
            </div>
          );
        })}

        {!conversions.length && (
          <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>
            No se encontraron conversiones que coincidan con los filtros aplicados.
          </div>
        )}
      </div>

      {selectedConversion && (
        <AdminConversionDetailModal
          conversion={selectedConversion}
          onClose={() => setSelectedConversion(null)}
        />
      )}
    </>
  );
}
