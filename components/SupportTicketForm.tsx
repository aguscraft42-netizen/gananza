"use client";

import { useState } from "react";

export function SupportTicketForm({ realMode }: { realMode: boolean }) {
  const [subject, setSubject] = useState("Recompensa faltante");
  const [message, setMessage] = useState("Quiero revisar el estado de mi recompensa.");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subject, category: "reward", message }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos crear el ticket");
      setStatus(realMode ? "Ticket creado. El equipo podrá responder desde administración." : "Ticket de demostración creado.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "No pudimos crear el ticket."); }
    finally { setBusy(false); }
  }
  return <form className="form-stack" onSubmit={submit}><label>Asunto<select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Recompensa faltante</option><option>Retiro</option><option>Acceso a la cuenta</option><option>Otro</option></select></label><label>Mensaje<textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)}/></label><button className="primary-button button-wide" disabled={busy}>{busy ? "Creando…" : "Crear ticket"}</button>{status && <small className="form-note">{status}</small>}</form>;
}
