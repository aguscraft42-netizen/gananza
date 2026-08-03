"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import type { WithdrawalRulesConfig } from "@/lib/gananza/withdrawal-rules";

type AdminWithdrawalRulesControlProps = {
  initialRules: WithdrawalRulesConfig;
  realMode?: boolean;
  isAdmin?: boolean;
};

export function AdminWithdrawalRulesControl({
  initialRules,
  realMode = false,
  isAdmin = true,
}: AdminWithdrawalRulesControlProps) {
  const [rules, setRules] = useState<WithdrawalRulesConfig>(initialRules);
  const [minMpInput, setMinMpInput] = useState<string>(String(initialRules.minAmountMercadoPago));
  const [minBankInput, setMinBankInput] = useState<string>(String(initialRules.minAmountBankTransfer));
  const [cooldownInput, setCooldownInput] = useState<string>(String(initialRules.cooldownDaysAfterPaid));
  const [reasonInput, setReasonInput] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const formattedUpdateDate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(rules.updatedAt));

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const parsedMp = Number.parseFloat(minMpInput);
    const parsedBank = Number.parseFloat(minBankInput);
    const parsedCooldown = Number.parseInt(cooldownInput, 10);

    if (Number.isNaN(parsedMp) || parsedMp <= 0) {
      setErrorMsg("El mínimo para Mercado Pago debe ser un número mayor que 0.");
      return;
    }
    if (Number.isNaN(parsedBank) || parsedBank <= 0) {
      setErrorMsg("El mínimo para transferencia bancaria debe ser un número mayor que 0.");
      return;
    }
    if (Number.isNaN(parsedCooldown) || parsedCooldown < 0) {
      setErrorMsg("Los días de espera deben ser un número no negativo.");
      return;
    }
    if (!reasonInput.trim()) {
      setErrorMsg("El motivo de la modificación es obligatorio para auditoría.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmModal(false);
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    const parsedMp = Number.parseFloat(minMpInput);
    const parsedBank = Number.parseFloat(minBankInput);
    const parsedCooldown = Number.parseInt(cooldownInput, 10);

    try {
      if (!realMode) {
        const updated: WithdrawalRulesConfig = {
          ...rules,
          minAmountMercadoPago: parsedMp,
          minAmountBankTransfer: parsedBank,
          cooldownDaysAfterPaid: parsedCooldown,
          updatedAt: new Date().toISOString(),
          updatedByName: "Administrador Demo",
        };
        setRules(updated);
        setReasonInput("");
        setSuccessMsg("Reglas de retiro actualizadas correctamente en modo demo.");
        return;
      }

      const res = await fetch("/api/admin/withdrawal-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minMercadoPago: parsedMp,
          minBankTransfer: parsedBank,
          cooldownDays: parsedCooldown,
          reason: reasonInput.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "No pudimos actualizar las reglas de retiro.");
      }

      setRules(result.data);
      setReasonInput("");
      setSuccessMsg("Reglas de retiro actualizadas y auditadas correctamente.");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al guardar las reglas de retiro.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section-card" style={{ marginBottom: "24px" }}>
      <div className="section-head">
        <div>
          <span className="eyebrow" style={{ color: "#a78bfa", fontWeight: 700 }}>REGLAS DE OPERACIÓN</span>
          <h2 style={{ fontSize: "18px", color: "#f8fafc" }}>Reglas Configurables de Retiro</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            Límites mínimos por método, solicitudes activas y período de espera tras retiros pagados.
          </p>
        </div>
        <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", background: "rgba(124, 58, 237, 0.15)", color: "#c4b5fd", border: "1px solid rgba(124, 58, 237, 0.3)", fontWeight: 600 }}>
          {isAdmin ? "Control Administrador" : "Solo Lectura"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "20px 0", padding: "16px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div>
          <small style={{ color: "#64748b", fontSize: "11px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            MÍNIMO MERCADO PAGO
          </small>
          <strong style={{ fontSize: "20px", color: "#4ade80", fontWeight: 700 }}>
            ${rules.minAmountMercadoPago.toLocaleString("es-AR")} ARS
          </strong>
        </div>

        <div>
          <small style={{ color: "#64748b", fontSize: "11px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            MÍNIMO TRANSFERENCIA BANCARIA
          </small>
          <strong style={{ fontSize: "20px", color: "#60a5fa", fontWeight: 700 }}>
            ${rules.minAmountBankTransfer.toLocaleString("es-AR")} ARS
          </strong>
        </div>

        <div>
          <small style={{ color: "#64748b", fontSize: "11px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            ESPERA TRAS PAGO / SOLICITUDES
          </small>
          <strong style={{ fontSize: "16px", color: "#f8fafc", fontWeight: 600, display: "block", marginTop: "2px" }}>
            {rules.cooldownDaysAfterPaid} días · Máx 1 activa
          </strong>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>Modificado por: {rules.updatedByName || "Sistema"} ({formattedUpdateDate})</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon name="search" size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#86efac", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Icon name="check" size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handlePreSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Mínimo Mercado Pago (ARS) *
              </label>
              <input
                type="number"
                step="100"
                min="100"
                value={minMpInput}
                onChange={(e) => setMinMpInput(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", fontSize: "14px" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Mínimo Transferencia (ARS) *
              </label>
              <input
                type="number"
                step="100"
                min="100"
                value={minBankInput}
                onChange={(e) => setMinBankInput(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", fontSize: "14px" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Días de espera tras pago *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="90"
                value={cooldownInput}
                onChange={(e) => setCooldownInput(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", fontSize: "14px" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Motivo del cambio (Obligatorio para auditoría) *
            </label>
            <textarea
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="Describí el motivo del ajuste en las políticas de retiro"
              rows={2}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", fontSize: "14px", resize: "vertical" }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="primary-button" disabled={busy} style={{ padding: "10px 24px", fontSize: "14px", fontWeight: 600 }}>
              {busy ? "Guardando…" : "Actualizar reglas de retiro"}
            </button>
          </div>
        </form>
      )}

      {showConfirmModal && (
        <div className="modal-backdrop open" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <article className="task-modal" style={{ maxWidth: "520px", width: "100%", background: "#12141d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", color: "#f8fafc", marginBottom: "12px" }}>Confirmar cambio de reglas de retiro</h3>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
              ¿Confirmás modificar las reglas de retiro con los siguientes parámetros?
            </p>
            <ul style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px", paddingLeft: "20px", lineHeight: "1.6" }}>
              <li>Mínimo Mercado Pago: <strong>${Number.parseFloat(minMpInput).toLocaleString("es-AR")} ARS</strong></li>
              <li>Mínimo Transferencia: <strong>${Number.parseFloat(minBankInput).toLocaleString("es-AR")} ARS</strong></li>
              <li>Días de espera tras pago: <strong>{cooldownInput} días</strong></li>
            </ul>
            <div style={{ padding: "12px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px", fontSize: "13px", color: "#94a3b8" }}>
              <strong>Motivo:</strong> {reasonInput}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" className="secondary-button" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button type="button" className="primary-button" onClick={handleConfirmUpdate} disabled={busy}>Confirmar actualización</button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
