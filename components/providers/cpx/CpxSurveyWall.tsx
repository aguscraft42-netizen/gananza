"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icons";
import { cpxAdapter } from "@/lib/providers/cpx";

type CpxSurveyWallProps = {
  userId: string;
  email?: string;
  displayName?: string;
};

export function CpxSurveyWall({ userId, email, displayName }: CpxSurveyWallProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const searchParams = useSearchParams();

  const cpxMessageId = searchParams.get("cpx_message_id");
  const cpxStatus = searchParams.get("cpx_status") || searchParams.get("status");

  const iframeUrl = cpxAdapter.getIframeUrl({ userId, email, displayName });

  const getReturnNotice = () => {
    if (!cpxMessageId && !cpxStatus) return null;
    if (cpxStatus === "1" || cpxStatus === "success" || cpxStatus === "confirmed") {
      return {
        type: "success" as const,
        title: "¡Encuesta finalizada!",
        message: "Tu participación ha sido registrada correctamente. La recompensa se acreditará automáticamente en tu saldo en breve.",
      };
    }
    if (cpxStatus === "2" || cpxStatus === "screenout" || cpxStatus === "out_of_target") {
      return {
        type: "info" as const,
        title: "Encuesta no completada",
        message: "No cumplías con el perfil específico requerido por el anunciante para esta encuesta. ¡Podés intentar con la siguiente!",
      };
    }
    return {
      type: "info" as const,
      title: "Resultado de la encuesta",
      message: "Has regresado a Gananza. Podés seleccionar una nueva encuesta disponible en la pared.",
    };
  };

  const notice = getReturnNotice();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {notice && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: notice.type === "success" ? "rgba(34, 197, 94, 0.12)" : "rgba(59, 130, 246, 0.12)",
            border: notice.type === "success" ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(59, 130, 246, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span style={{ color: notice.type === "success" ? "#4ade80" : "#60a5fa", display: "inline-flex" }}>
            <Icon name={notice.type === "success" ? "check" : "shield"} size={22} />
          </span>
          <div>
            <strong style={{ color: "#f8fafc", fontSize: "15px", display: "block" }}>{notice.title}</strong>
            <span style={{ color: "#cbd5e1", fontSize: "13px" }}>{notice.message}</span>
          </div>
        </div>
      )}

      <div className="cpx-survey-wall-container" style={{ width: "100%", borderRadius: "16px", overflow: "hidden", position: "relative", minHeight: "680px", background: "rgba(18, 20, 29, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", zIndex: 10, background: "#0c0e14" }}>
            <div className="spinner" style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#7c3aed", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>Cargando encuestas de CPX Research…</p>
          </div>
        )}

        {error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", padding: "32px", textAlign: "center" }}>
            <span style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", marginBottom: "16px" }}>
              <Icon name="search" size={32} />
            </span>
            <h3 style={{ color: "#f8fafc", fontSize: "18px", marginBottom: "8px" }}>No pudimos cargar la pared de encuestas</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "420px", marginBottom: "20px" }}>Verificá tu conexión a internet o intenta nuevamente en unos instantes.</p>
            <button type="button" className="secondary-button" onClick={() => { setError(false); setLoading(true); }}>Reintentar</button>
          </div>
        ) : (
          <iframe
            src={iframeUrl}
            title="CPX Research Encuestas"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            style={{ width: "100%", height: "720px", border: "none", display: loading ? "none" : "block" }}
            allow="autoplay; camera"
          />
        )}
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
