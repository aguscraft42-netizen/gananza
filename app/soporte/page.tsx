import { AppShell } from "@/components/AppShell";
import { SupportTicketForm } from "@/components/SupportTicketForm";
import { getAppContext } from "@/lib/gananza/server-data";

const faqs=[
  ["¿Cuándo se acredita una tarea?","Depende del proveedor. Algunas son inmediatas y otras pueden demorar entre 24 y 72 horas."],
  ["¿Por qué una tarea fue rechazada?","Puede ocurrir por instalación previa, cuenta duplicada, uso de VPN, objetivo incompleto o vencimiento."],
  ["¿Qué saldo puedo retirar?","Únicamente el saldo confirmado y disponible. El saldo pendiente todavía está en revisión."],
  ["¿Puedo repetir una tarea?","Solo cuando la campaña lo permite. Repetir una conversión única puede invalidarla."],
];

export default async function SupportPage() {
  const context = await getAppContext();
  return <AppShell active="/soporte"><section className="page-content"><div className="v3-page-heading"><div><span className="eyebrow">AYUDA Y RECLAMOS</span><h1>Soporte que explica, no que esconde.</h1><p>Encontrá respuestas o creá un ticket asociado a tu cuenta.</p></div><span className="support-status"><i/>Respuesta estimada: 24 h</span></div><div className="support-grid"><section className="section-card"><div className="section-head"><div><span className="eyebrow">PREGUNTAS FRECUENTES</span><h2>Respuestas rápidas</h2></div></div><div className="faq-list">{faqs.map(([title,copy],index)=><details key={title} open={index===0}><summary>{title}<span>+</span></summary><p>{copy}</p></details>)}</div></section><aside className="section-card ticket-card"><span className="eyebrow">NUEVO TICKET</span><h2>Contanos qué pasó</h2><p>{context.configured ? "El ticket y el primer mensaje se crean juntos mediante una función transaccional." : "En modo demo no se envía información real."}</p><SupportTicketForm realMode={context.configured}/></aside></div></section></AppShell>;
}
