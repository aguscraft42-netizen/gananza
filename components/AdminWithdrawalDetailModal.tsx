"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { CategoryIcon } from "@/components/ui/category-icon";

export type AdminQueueItem = {
  id: string;
  userId: string;
  user: string;
  userEmail: string;
  amount: number;
  method: string;
  methodType: string;
  destination: string;
  holderName?: string;
  holderDocument?: string;
  createdAt: string;
  risk: number;
  status: string;
  age: string;
  availableBalance?: number;
  heldBalance?: number;
  pastWithdrawalsCount?: number;
  recentConversionsCount?: number;
  notes?: string;
};

type AdminWithdrawalDetailModalProps = {
  item: AdminQueueItem;
  realMode: boolean;
  canReview: boolean;
  onClose: () => void;
};

export function AdminWithdrawalDetailModal({
  item,
  realMode,
  canReview,
  onClose,
}: AdminWithdrawalDetailModalProps) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionType, setActionType] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [providerReference, setProviderReference] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const router = useRouter();

  const isMercadoPago = item.methodType === "mercado_pago";
  const riskClass = item.risk >= 70 ? "high" : item.risk >= 35 ? "medium" : "low";

  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(item.createdAt));

  async function executeAction(action: string) {
    setErrorMsg("");
    setSuccessMsg("");

    if (action === "reject" && !rejectReason.trim()) {
      setErrorMsg("El motivo de rechazo es obligatorio para registrar en la auditoría.");
      return;
    }

    if (action === "paid" && (!providerReference.trim() || providerReference.trim().length < 4)) {
      setErrorMsg("La referencia de transferencia u operación es obligatoria.");
      return;
    }

    if (!realMode) {
      setSuccessMsg(`[DEMO] Acción '${action}' ejecutada correctamente.`);
      setActionType(null);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          note: action === "reject" ? rejectReason.trim() : `Acción ${action} por administración`,
          providerReference: action === "paid" ? providerReference.trim() : null,
          receiptName: action === "paid" ? receiptName.trim() || null : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar el retiro.");

      setSuccessMsg(`Solicitud actualizada exitosamente a estado: ${data.withdrawal?.status || action}`);
      setActionType(null);
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar el retiro.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop open"
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.8)",
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
            border: "0",
            color: "#94a3b8",
            fontSize: "20px",
            cursor: "pointer",
          }}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Encabezado del Detalle */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: isMercadoPago ? "rgba(0, 200, 111, 0.1)" : "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isMercadoPago ? <MercadoPagoLogo compact /> : <CategoryIcon type="other-bank" size={32} />}
          </div>
          <div>
            <span className="eyebrow" style={{ color: "#a78bfa", fontWeight: 700, fontSize: "11px" }}>
              DETALLE DE SOLICITUD DE RETIRO
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "2px 0 0 0" }}>
              ${item.amount.toLocaleString("es-AR")} ARS
            </h2>
            <small style={{ color: "#94a3b8", fontSize: "12px" }}>
              ID: {item.id} · {formattedDate} ({item.age})
            </small>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "13px", marginBottom: "16px" }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#86efac", fontSize: "13px", marginBottom: "16px" }}>
            {successMsg}
          </div>
        )}

        {/* Rejilla de Información Requerida */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          {/* Bloque Usuario */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>DATOS DEL USUARIO</span>
            <strong style={{ display: "block", fontSize: "15px", color: "#f8fafc", marginTop: "4px" }}>{item.user}</strong>
            <span style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginTop: "2px" }}>{item.userEmail}</span>
            <small style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "4px", wordBreak: "break-all" }}>
              UUID: {item.userId}
            </small>
          </div>

          {/* Bloque Destino */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>DESTINO DE PAGO</span>
            <strong style={{ display: "block", fontSize: "14px", color: "#f8fafc", marginTop: "4px" }}>{item.method}</strong>
            <span style={{ display: "block", fontSize: "13px", color: "#4ade80", marginTop: "2px", fontWeight: 600 }}>{item.destination}</span>
            <small style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              Titular: {item.holderName || "Registrado"} {item.holderDocument ? `(${item.holderDocument})` : ""}
            </small>
          </div>

          {/* Bloque Saldos */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>SALDOS Y CUENTA</span>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "13px" }}>
              <span style={{ color: "#94a3b8" }}>Disponible:</span>
              <strong style={{ color: "#4ade80" }}>${(item.availableBalance || 0).toLocaleString("es-AR")} ARS</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "13px" }}>
              <span style={{ color: "#94a3b8" }}>Retenido actual:</span>
              <strong style={{ color: "#facc15" }}>${(item.heldBalance || item.amount).toLocaleString("es-AR")} ARS</strong>
            </div>
          </div>

          {/* Bloque Historial y Riesgo */}
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>ACTIVIDAD Y RIESGO</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Nivel de riesgo:</span>
              <i className={`risk ${riskClass}`} style={{ fontSize: "11px", padding: "3px 8px" }}>{item.risk} pts</i>
            </div>
            <small style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginTop: "6px" }}>
              Retiros anteriores: {item.pastWithdrawalsCount ?? 0} · Conversiones: {item.recentConversionsCount ?? 0}
            </small>
          </div>
        </div>

        {/* Observaciones Administrativas */}
        <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>OBSERVACIONES Y ESTADO</span>
          <p style={{ fontSize: "13px", color: "#cbd5e1", margin: "4px 0 0 0" }}>
            Estado: <strong style={{ color: "#f8fafc" }}>{item.status.toUpperCase()}</strong> · {item.notes || "Sin observaciones adicionales."}
          </p>
        </div>

        {/* Formulario de Rechazar */}
        {actionType === "reject" && (
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#fca5a5", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Motivo de rechazo (Obligatorio para auditoría y liberación de saldo) *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Indicá la razón detallada por la que se rechaza la solicitud..."
              rows={2}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "13px", marginBottom: "12px" }}
              required
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="secondary-button" onClick={() => setActionType(null)}>
                Cancelar
              </button>
              <button type="button" className="primary-button" style={{ background: "#ef4444", color: "white" }} disabled={busy} onClick={() => executeAction("reject")}>
                {busy ? "Rechazando…" : "Confirmar rechazo y liberar saldo"}
              </button>
            </div>
          </div>
        )}

        {/* Formulario de Pagado */}
        {actionType === "paid" && (
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#86efac", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Referencia de transferencia / operación (Obligatorio) *
            </label>
            <input
              type="text"
              value={providerReference}
              onChange={(e) => setProviderReference(e.target.value)}
              placeholder="Ej: MP-9876543210 / CBU-TR-112233"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "13px", marginBottom: "10px" }}
              required
            />
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
              Nombre de comprobante (Opcional)
            </label>
            <input
              type="text"
              value={receiptName}
              onChange={(e) => setReceiptName(e.target.value)}
              placeholder="comprobante_mp_98765.pdf"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "13px", marginBottom: "12px" }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="secondary-button" onClick={() => setActionType(null)}>
                Cancelar
              </button>
              <button type="button" className="primary-button" disabled={busy} onClick={() => executeAction("paid")}>
                {busy ? "Guardando…" : "Confirmar pago registrado"}
              </button>
            </div>
          </div>
        )}

        {/* Botones de Acción Principal */}
        {canReview && !actionType && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "flex-end" }}>
            {item.status === "requested" && (
              <button type="button" className="secondary-button" disabled={busy} onClick={() => executeAction("review")}>
                Pasar a revisión
              </button>
            )}

            {["requested", "reviewing"].includes(item.status) && (
              <button type="button" className="secondary-button" disabled={busy} onClick={() => executeAction("approve")}>
                Aprobar / Marcar procesando
              </button>
            )}

            {["requested", "reviewing", "approved"].includes(item.status) && (
              <button
                type="button"
                className="secondary-button"
                style={{ color: "#fca5a5", borderColor: "rgba(239,68,68,0.3)" }}
                disabled={busy}
                onClick={() => setActionType("reject")}
              >
                Rechazar solicitud
              </button>
            )}

            {item.status === "approved" && (
              <button type="button" className="primary-button" disabled={busy} onClick={() => setActionType("paid")}>
                Marcar como pagado
              </button>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
