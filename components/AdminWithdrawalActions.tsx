"use client";

import { useState } from "react";
import { AdminWithdrawalDetailModal, type AdminQueueItem } from "./AdminWithdrawalDetailModal";

type AdminWithdrawalActionsProps = {
  id: string;
  status: string;
  realMode: boolean;
  canReview?: boolean;
  methodType?: string;
  item?: AdminQueueItem;
};

export function AdminWithdrawalActions({
  id,
  status,
  realMode,
  canReview = true,
  methodType = "bank_transfer",
  item,
}: AdminWithdrawalActionsProps) {
  const [showModal, setShowModal] = useState(false);

  const fallbackItem: AdminQueueItem = item || {
    id,
    userId: "00000000-0000-4000-8000-000000000000",
    user: "Usuario Registrado",
    userEmail: "usuario@gananza.app",
    amount: 5000,
    method: methodType === "mercado_pago" ? "Mercado Pago" : "Transferencia a otro banco",
    methodType,
    destination: "Destino protegido",
    createdAt: new Date().toISOString(),
    risk: 10,
    status,
    age: "1 h",
    availableBalance: 5000,
    heldBalance: 5000,
    pastWithdrawalsCount: 1,
    recentConversionsCount: 2,
    notes: "Solicitud registrada",
  };

  if (!canReview) return <div className="admin-inline-actions"><small>Solo lectura</small></div>;

  return (
    <>
      <div className="admin-inline-actions">
        <button
          type="button"
          className="primary-button"
          style={{ padding: "4px 12px", fontSize: "11px", minHeight: "30px" }}
          onClick={() => setShowModal(true)}
        >
          Ver detalle / Acciones
        </button>
      </div>

      {showModal && (
        <AdminWithdrawalDetailModal
          item={fallbackItem}
          realMode={realMode}
          canReview={canReview}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
