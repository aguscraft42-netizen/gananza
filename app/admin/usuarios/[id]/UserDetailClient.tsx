"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminUserStatusModal } from "@/components/AdminUserStatusModal";
import type { AdminUserDetail } from "@/lib/gananza/user-management";

type Props = {
  user: AdminUserDetail;
  canManage: boolean;
};

export function UserDetailClient({ user, canManage }: Props) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const isSuspended = Boolean(user.suspendedAt);

  const formattedRegisterDate = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(user.createdAt));

  const formattedSuspendedDate = user.suspendedAt
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(user.suspendedAt))
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Botón de volver */}
      <div>
        <Link href="/admin/usuarios" style={{ color: "var(--green)", fontSize: "13px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
          ← Volver al listado de usuarios
        </Link>
      </div>

      {/* Encabezado del Usuario y Acciones */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          padding: "24px",
          borderRadius: "18px",
          background: "linear-gradient(150deg, rgba(19,40,62,0.92), rgba(9,26,43,0.9))",
          border: "1px solid var(--line)",
        }}
      >
        <div>
          <span className="eyebrow" style={{ color: "#a78bfa", fontWeight: 700, fontSize: "11px" }}>
            DETALLE DE USUARIO
          </span>
          <h1 style={{ fontSize: "26px", margin: "4px 0 2px 0", letterSpacing: "-0.5px" }}>
            {user.displayName}
          </h1>
          <span style={{ fontSize: "14px", color: "#cbd5e1" }}>{user.email}</span>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }}>
            <small style={{ color: "#64748b", fontFamily: "monospace", fontSize: "12px" }}>
              UUID: {user.id}
            </small>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                background: isSuspended ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                color: isSuspended ? "#fca5a5" : "#86efac",
              }}
            >
              {isSuspended ? "Cuenta Suspendida" : "Cuenta Activa"}
            </span>
          </div>
        </div>

        {canManage && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="primary-button"
              style={{
                background: isSuspended ? "var(--green)" : "#ef4444",
                color: isSuspended ? "#02140c" : "white",
              }}
              onClick={() => setShowStatusModal(true)}
            >
              {isSuspended ? "Reactivar cuenta" : "Suspender cuenta"}
            </button>
          </div>
        )}
      </div>

      {/* Alerta si la cuenta está suspendida */}
      {isSuspended && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "14px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
          }}
        >
          <strong style={{ fontSize: "14px", display: "block" }}>
            Cuenta suspendida el {formattedSuspendedDate}
          </strong>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#f8fafc" }}>
            Motivo registrado: {user.suspensionReason || "Sin motivo especificado."}
          </p>
        </div>
      )}

      {/* Rejilla 1: Perfil, Nivel, Riesgo y Saldos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Datos de Perfil */}
        <div className="section-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
            DATOS DE PERFIL Y REGISTRO
          </span>
          <div style={{ marginTop: "10px", display: "grid", gap: "8px", fontSize: "13px" }}>
            <div><span style={{ color: "#94a3b8" }}>Fecha de registro:</span> <strong>{formattedRegisterDate}</strong></div>
            <div><span style={{ color: "#94a3b8" }}>País:</span> <strong>{user.countryCode}</strong></div>
            <div><span style={{ color: "#94a3b8" }}>Nacimiento:</span> <strong>{user.birthDate || "No registrado"}</strong></div>
            <div><span style={{ color: "#94a3b8" }}>Preferencia de cobro:</span> <strong>{user.payoutPreference === "mercado_pago" ? "Mercado Pago" : "Transferencia a otro banco"}</strong></div>
            <div><span style={{ color: "#94a3b8" }}>Intereses:</span> <strong>{user.interests?.join(", ") || "General"}</strong></div>
          </div>
        </div>

        {/* Nivel y Gamificación */}
        <div className="section-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
            NIVEL Y PROGRESO DE USUARIO
          </span>
          <div style={{ marginTop: "10px", display: "grid", gap: "8px", fontSize: "13px" }}>
            <div><span style={{ color: "#94a3b8" }}>Nivel actual:</span> <strong style={{ color: "#a78bfa", fontSize: "16px" }}>Nivel {user.level}</strong></div>
            <div><span style={{ color: "#94a3b8" }}>Puntos de experiencia (XP):</span> <strong>{user.experiencePoints.toLocaleString("es-AR")} XP</strong></div>
            <div><span style={{ color: "#94a3b8" }}>Racha de días activos:</span> <strong>{user.streakDays} días seguidos</strong></div>
            <div><span style={{ color: "#94a3b8" }}>Visualización de saldo:</span> <strong>{user.hideBalance ? "Oculto por usuario" : "Visible"}</strong></div>
          </div>
        </div>

        {/* Puntuación de Riesgo */}
        <div className="section-card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
            SEGURIDAD Y RIESGO
          </span>
          <div style={{ marginTop: "10px" }}>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Score de Riesgo:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
              <strong style={{ fontSize: "24px", color: user.riskScore >= 70 ? "#ef4444" : user.riskScore >= 35 ? "#facc15" : "#4ade80" }}>
                {user.riskScore} / 100
              </strong>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: user.riskScore >= 70 ? "rgba(239,68,68,0.2)" : user.riskScore >= 35 ? "rgba(234,179,8,0.2)" : "rgba(34,197,94,0.2)",
                  color: user.riskScore >= 70 ? "#fca5a5" : user.riskScore >= 35 ? "#fef08a" : "#86efac",
                }}
              >
                {user.riskScore >= 70 ? "Riesgo Alto" : user.riskScore >= 35 ? "Riesgo Medio" : "Riesgo Bajo"}
              </span>
            </div>
            <small style={{ color: "#64748b", fontSize: "11px", display: "block", marginTop: "8px" }}>
              Calculado automáticamente según conversiones y patrones de retiro.
            </small>
          </div>
        </div>
      </div>

      {/* Rejilla 2: Saldos Financieros */}
      <div className="section-card" style={{ padding: "20px" }}>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
          ESTADO FINANCIERO DE LA CUENTA
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>DISPONIBLE</small>
            <strong style={{ fontSize: "22px", color: "#4ade80", marginTop: "4px", display: "block" }}>
              ${user.availableBalance.toLocaleString("es-AR")} ARS
            </strong>
          </div>
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>PENDIENTE</small>
            <strong style={{ fontSize: "22px", color: "#facc15", marginTop: "4px", display: "block" }}>
              ${user.pendingBalance.toLocaleString("es-AR")} ARS
            </strong>
          </div>
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>RETENIDO EN REVISIÓN</small>
            <strong style={{ fontSize: "22px", color: "#60a5fa", marginTop: "4px", display: "block" }}>
              ${user.heldBalance.toLocaleString("es-AR")} ARS
            </strong>
          </div>
          <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <small style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>RETIRADO HISTÓRICO</small>
            <strong style={{ fontSize: "22px", color: "#c084fc", marginTop: "4px", display: "block" }}>
              ${user.withdrawnBalance.toLocaleString("es-AR")} ARS
            </strong>
          </div>
        </div>
      </div>

      {/* Historial del Ledger */}
      <div className="section-card" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "16px", margin: "0 0 12px 0" }}>Historial del Ledger ({user.ledgerEntries.length})</h3>
        <div style={{ overflowX: "auto" }}>
          <div className="admin-table">
            <div className="admin-row head" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "10px", fontSize: "11px" }}>
              <span>Descripción</span>
              <span>Tipo de Movimiento</span>
              <span>Monto</span>
              <span>Fecha</span>
            </div>
            {user.ledgerEntries.map((row) => (
              <div className="admin-row" key={row.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "10px", fontSize: "12px" }}>
                <span>{row.description}</span>
                <span style={{ color: "#94a3b8" }}>{row.entryType}</span>
                <strong style={{ color: row.amount >= 0 ? "#4ade80" : "#fca5a5" }}>
                  {row.amount >= 0 ? "+" : ""}${row.amount.toLocaleString("es-AR")} ARS
                </strong>
                <span style={{ color: "#94a3b8" }}>
                  {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(row.createdAt))}
                </span>
              </div>
            ))}
            {!user.ledgerEntries.length && <div style={{ padding: "16px", color: "#94a3b8", fontSize: "13px" }}>Sin registros en el ledger.</div>}
          </div>
        </div>
      </div>

      {/* Solicitudes de Retiro y Conversiones */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* Solicitudes de Retiro */}
        <div className="section-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", margin: "0 0 12px 0" }}>Solicitudes de Retiro ({user.recentWithdrawals.length})</h3>
          <div style={{ display: "grid", gap: "8px" }}>
            {user.recentWithdrawals.map((w) => (
              <div key={w.id} style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>${w.amount.toLocaleString("es-AR")} ARS</strong>
                  <small style={{ color: "#94a3b8", fontSize: "11px" }}>{w.methodLabel}</small>
                </div>
                <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}>
                  {w.status.toUpperCase()}
                </span>
              </div>
            ))}
            {!user.recentWithdrawals.length && <div style={{ color: "#94a3b8", fontSize: "13px" }}>Sin retiros solicitados.</div>}
          </div>
        </div>

        {/* Últimas Conversiones */}
        <div className="section-card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", margin: "0 0 12px 0" }}>Últimas Conversiones ({user.recentConversions.length})</h3>
          <div style={{ display: "grid", gap: "8px" }}>
            {user.recentConversions.map((c) => (
              <div key={c.id} style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>{c.offerTitle}</strong>
                  <small style={{ color: "#4ade80", fontSize: "11px" }}>+${c.rewardAmount.toLocaleString("es-AR")} ARS</small>
                </div>
                <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}>
                  {c.status.toUpperCase()}
                </span>
              </div>
            ))}
            {!user.recentConversions.length && <div style={{ color: "#94a3b8", fontSize: "13px" }}>Sin conversiones registradas.</div>}
          </div>
        </div>
      </div>

      {/* Auditoría de Acciones Administrativas */}
      <div className="section-card" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "16px", margin: "0 0 12px 0" }}>Registro de Auditoría Administrativa</h3>
        <div style={{ display: "grid", gap: "8px" }}>
          {user.auditHistory.map((a) => (
            <div key={a.id} style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ color: "var(--green-2)" }}>{a.action}</strong>
                <span style={{ color: "#94a3b8" }}>
                  {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(a.createdAt))}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", color: "#cbd5e1" }}>
                Realizado por: <strong>{a.actorName}</strong> {a.note ? `· Motivo/Nota: ${a.note}` : ""}
              </p>
            </div>
          ))}
          {!user.auditHistory.length && <div style={{ color: "#94a3b8", fontSize: "13px" }}>Sin acciones registradas en auditoría.</div>}
        </div>
      </div>

      {/* Modal de Suspender / Reactivar */}
      {showStatusModal && (
        <AdminUserStatusModal
          userId={user.id}
          userName={user.displayName}
          userEmail={user.email}
          isSuspended={isSuspended}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
}
