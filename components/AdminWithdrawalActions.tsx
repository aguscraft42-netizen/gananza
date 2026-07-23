"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminWithdrawalActions({
  id,
  status,
  realMode,
  canReview = true,
  methodType = "bank_transfer",
}: {
  id: string;
  status: string;
  realMode: boolean;
  canReview?: boolean;
  methodType?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [reference, setReference] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const router = useRouter();

  async function act(action: string) {
    if (action === "paid" && reference.trim().length < 4) {
      setMessage("Ingresá la referencia de la transferencia.");
      return;
    }
    if (!realMode) {
      setMessage(action === "paid" ? `Pago demo registrado: ${reference || "MP-DEMO-001"}` : `Acción demo: ${action}`);
      setShowPaymentForm(false);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          note: action === "paid" ? `Transferencia ${methodType === "mercado_pago" ? "a Mercado Pago" : "bancaria"} confirmada` : `Acción ${action} desde panel Gananza`,
          providerReference: action === "paid" ? reference.trim() : null,
          receiptName: action === "paid" ? receiptName.trim() || null : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos actualizar el retiro");
      setShowPaymentForm(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos actualizar.");
    } finally {
      setBusy(false);
    }
  }

  if (!canReview) return <div className="admin-inline-actions"><small>Solo lectura</small></div>;

  return (
    <div className="admin-inline-actions admin-payment-actions">
      {status === "requested" && <button disabled={busy} onClick={() => act("review")}>Revisar</button>}
      {["requested", "reviewing"].includes(status) && <button disabled={busy} onClick={() => act("approve")}>Aprobar</button>}
      {["requested", "reviewing", "approved"].includes(status) && <button className="danger" disabled={busy} onClick={() => act("reject")}>Rechazar</button>}
      {status === "approved" && !showPaymentForm && (
        <button disabled={busy} onClick={() => setShowPaymentForm(true)}>
          Registrar transferencia
        </button>
      )}
      {status === "approved" && showPaymentForm && (
        <div className="admin-payment-form">
          <label>
            Referencia {methodType === "mercado_pago" ? "de Mercado Pago" : "bancaria"}
            <input value={reference} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setReference(event.target.value)} placeholder="Ej. MP-987654321" />
          </label>
          <label>
            Nombre del comprobante
            <input value={receiptName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setReceiptName(event.target.value)} placeholder="comprobante-987654.pdf" />
          </label>
          <div>
            <button disabled={busy || reference.trim().length < 4} onClick={() => act("paid")}>{busy ? "Guardando…" : "Marcar pagado"}</button>
            <button className="danger" disabled={busy} onClick={() => setShowPaymentForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
      {message && <small>{message}</small>}
    </div>
  );
}
