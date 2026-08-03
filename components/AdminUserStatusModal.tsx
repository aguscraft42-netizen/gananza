"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUserStatusModalProps = {
  userId: string;
  userName: string;
  userEmail: string;
  isSuspended: boolean;
  onClose: () => void;
};

export function AdminUserStatusModal({
  userId,
  userName,
  userEmail,
  isSuspended,
  onClose,
}: AdminUserStatusModalProps) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const targetAction = isSuspended ? "reactivate" : "suspend";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (targetAction === "suspend" && !reason.trim()) {
      setErrorMsg("El motivo de suspensión es obligatorio.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: targetAction, reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar el estado del usuario.");

      setSuccessMsg(
        targetAction === "suspend"
          ? "Cuenta suspendida exitosamente y registrada en auditoría."
          : "Cuenta reactivada exitosamente y registrada en auditoría."
      );
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error de comunicación.");
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
          maxWidth: "520px",
          width: "100%",
          background: "#12141d",
          border: "1px solid rgba(255,255,255,0.12)",
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

        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" }}>
          {isSuspended ? "Reactivar cuenta de usuario" : "Suspender cuenta de usuario"}
        </h3>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0" }}>
          Usuario: <strong style={{ color: "#f8fafc" }}>{userName}</strong> ({userEmail})
        </p>

        {errorMsg && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: "13px", marginBottom: "14px" }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac", fontSize: "13px", marginBottom: "14px" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {targetAction === "suspend" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#fca5a5", marginBottom: "6px" }}>
                Motivo de suspensión (Obligatorio) *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detalla la causa administrativa o de seguridad de la suspensión..."
                rows={3}
                style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "13px" }}
                required
              />
            </div>
          )}

          {targetAction === "reactivate" && (
            <p style={{ fontSize: "13px", color: "#86efac", marginBottom: "16px" }}>
              ¿Confirmás que querés reactivar el acceso de este usuario a Gananza? La acción quedará registrada en auditoría.
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button
              type="submit"
              className="primary-button"
              style={{ background: targetAction === "suspend" ? "#ef4444" : "var(--green)", color: targetAction === "suspend" ? "white" : "#02140c" }}
              disabled={busy}
            >
              {busy ? "Procesando..." : targetAction === "suspend" ? "Confirmar suspensión" : "Confirmar reactivación"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
