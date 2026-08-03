"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import type { ExchangeRateConfig } from "@/lib/gananza/exchange-rate";

type AdminExchangeRateControlProps = {
  initialConfig: ExchangeRateConfig;
  realMode?: boolean;
  isAdmin?: boolean;
};

export function AdminExchangeRateControl({
  initialConfig,
  realMode = false,
  isAdmin = true,
}: AdminExchangeRateControlProps) {
  const [config, setConfig] = useState<ExchangeRateConfig>(initialConfig);
  const [rateInput, setRateInput] = useState<string>(String(initialConfig.fxRateArsUsd));
  const [sourceInput, setSourceInput] = useState<string>(initialConfig.fxSource || "Manual Admin");
  const [reasonInput, setReasonInput] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const formattedEffectiveDate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(config.fxEffectiveAt));

  const formattedUpdateDate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(config.updatedAt));

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const parsedRate = Number.parseFloat(rateInput);
    if (Number.isNaN(parsedRate) || !Number.isFinite(parsedRate) || parsedRate <= 0) {
      setErrorMsg("La cotización debe ser un valor numérico mayor que 0.");
      return;
    }

    if (parsedRate > 1000000) {
      setErrorMsg("La cotización no puede superar el límite máximo permitido.");
      return;
    }

    if (!reasonInput.trim()) {
      setErrorMsg("El motivo del cambio es obligatorio.");
      return;
    }

    // Abrir modal de confirmación previa
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmModal(false);
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    const parsedRate = Number.parseFloat(rateInput);

    try {
      if (!realMode) {
        // Modo demo o desarrollo sin Supabase
        const updated: ExchangeRateConfig = {
          ...config,
          fxRateArsUsd: parsedRate,
          fxSource: sourceInput.trim() || "Manual Admin",
          fxEffectiveAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedByName: "Administrador Demo",
        };
        setConfig(updated);
        setReasonInput("");
        setSuccessMsg(`Cotización actualizada exitosamente a $${parsedRate.toLocaleString("es-AR")} ARS / USD.`);
        return;
      }

      const res = await fetch("/api/admin/exchange-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rate: parsedRate,
          source: sourceInput.trim(),
          reason: reasonInput.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "No pudimos guardar la cotización.");
      }

      setConfig(result.data);
      setReasonInput("");
      setSuccessMsg(`Cotización actualizada correctamente a $${parsedRate.toLocaleString("es-AR")} ARS / USD.`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado al guardar la cotización.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section-card" style={{ marginBottom: "24px" }}>
      <div className="section-head">
        <div>
          <span className="eyebrow" style={{ color: "#a78bfa", fontWeight: 700 }}>CONFIGURACIÓN FINANCIERA</span>
          <h2 style={{ fontSize: "18px", color: "#f8fafc" }}>Tipo de Cambio ARS / USD</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>
            Cotización oficial de la plataforma utilizada para la equivalencia de campañas externas.
          </p>
        </div>
        <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", background: "rgba(124, 58, 237, 0.15)", color: "#c4b5fd", border: "1px solid rgba(124, 58, 237, 0.3)", fontWeight: 600 }}>
          {isAdmin ? "Control Administrador" : "Solo Lectura"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: "20px 0", padding: "16px", borderRadius: "12px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div>
          <small style={{ color: "#64748b", fontSize: "11px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            COTIZACIÓN VIGENTE
          </small>
          <strong style={{ fontSize: "22px", color: "#4ade80", fontWeight: 700 }}>
            ${config.fxRateArsUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })} ARS
          </strong>
          <span style={{ display: "block", color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>por 1,00 USD</span>
        </div>

        <div>
          <small style={{ color: "#64748b", fontSize: "11px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            FUENTE
          </small>
          <strong style={{ fontSize: "14px", color: "#f8fafc", fontWeight: 600, display: "block", marginTop: "4px" }}>
            {config.fxSource}
          </strong>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>Vigente desde: {formattedEffectiveDate}</span>
        </div>

        <div>
          <small style={{ color: "#64748b", fontSize: "11px", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            ÚLTIMA MODIFICACIÓN
          </small>
          <strong style={{ fontSize: "14px", color: "#cbd5e1", fontWeight: 600, display: "block", marginTop: "4px" }}>
            {config.updatedByName || "Sistema"}
          </strong>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>Fecha: {formattedUpdateDate}</span>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Nueva cotización (ARS por USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1000000"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                placeholder="Ej: 1350.00"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", fontSize: "14px" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Fuente de la cotización
              </label>
              <input
                type="text"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                placeholder="Ej: Manual Admin / Dólar MEP"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", fontSize: "14px" }}
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
              placeholder="Describí la razón de la actualización (ej: Ajuste mensual por inflación / cambio de referencia)"
              rows={2}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc", fontSize: "14px", resize: "vertical" }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="primary-button"
              disabled={busy}
              style={{ padding: "10px 24px", fontSize: "14px", fontWeight: 600 }}
            >
              {busy ? "Guardando…" : "Actualizar cotización"}
            </button>
          </div>
        </form>
      )}

      {/* Modal de Confirmación previa */}
      {showConfirmModal && (
        <div className="modal-backdrop open" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <article className="task-modal" style={{ maxWidth: "480px", width: "100%", background: "#12141d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", color: "#f8fafc", marginBottom: "12px" }}>Confirmar cambio de cotización</h3>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
              ¿Confirmás actualizar la cotización ARS/USD de <strong style={{ color: "#ef4444" }}>${config.fxRateArsUsd.toLocaleString("es-AR")} ARS</strong> a <strong style={{ color: "#4ade80" }}>${Number.parseFloat(rateInput).toLocaleString("es-AR")} ARS</strong> por USD?
            </p>
            <div style={{ padding: "12px", borderRadius: "8px", background: "#0c0e14", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px", fontSize: "13px", color: "#94a3b8" }}>
              <strong>Motivo:</strong> {reasonInput}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button type="button" className="secondary-button" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button type="button" className="primary-button" onClick={handleConfirmUpdate} disabled={busy}>
                Confirmar actualización
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
