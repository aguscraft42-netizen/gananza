"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MercadoPagoLogo } from "@/components/MercadoPagoLogo";
import { Icon } from "@/components/Icons";

type Method = {
  id: string;
  method_type: string;
  label: string;
  destination_masked: string;
  holder_name?: string | null;
  holder_document?: string | null;
  is_default?: boolean;
  is_verified?: boolean;
  cooldown_until?: string | null;
};

function normalizeDestination(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function maskDestination(value: string) {
  const trimmed = normalizeDestination(value);
  if (/^\d{22}$/.test(trimmed)) return `CVU •••• ${trimmed.slice(-4)}`;
  if (trimmed.length <= 8) return trimmed;
  return `${trimmed.slice(0, 3)}••••${trimmed.slice(-3)}`;
}

function isValidMercadoPagoDestination(value: string) {
  const destination = normalizeDestination(value);
  const isCvu = /^\d{22}$/.test(destination);
  const isAlias = /^[a-z0-9][a-z0-9._-]{4,29}[a-z0-9]$/.test(destination);
  return isCvu || isAlias;
}

function isValidBankDestination(value: string) {
  const destination = normalizeDestination(value);
  return /^\d{22}$/.test(destination) || /^[a-z0-9][a-z0-9._-]{4,29}[a-z0-9]$/.test(destination);
}

function isValidDocument(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 11;
}

export function PayoutMethodsManager({ initialMethods, realMode }: { initialMethods: Method[]; realMode: boolean }) {
  const [methods, setMethods] = useState(initialMethods);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("mercado_pago");
  const [destination, setDestination] = useState("");
  const [holder, setHolder] = useState("");
  const [document, setDocument] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());

  const destinationValid = useMemo(
    () => type === "mercado_pago" ? isValidMercadoPagoDestination(destination) : isValidBankDestination(destination),
    [destination, type],
  );
  const holderValid = holder.trim().length >= 4;
  const documentValid = isValidDocument(document);
  const formValid = destinationValid && holderValid && documentValid;

  async function addMethod(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!formValid) {
      setMessage("Revisá el destino, el nombre del titular y el documento.");
      return;
    }

    setBusy(true);
    const normalizedDestination = normalizeDestination(destination);
    const method: Method = {
      id: realMode ? crypto.randomUUID() : `demo-${Date.now()}`,
      method_type: type,
      label: type === "mercado_pago" ? "Mercado Pago" : "Transferencia bancaria",
      destination_masked: maskDestination(normalizedDestination),
      holder_name: holder.trim(),
      holder_document: document.replace(/\D/g, ""),
      is_default: methods.length === 0,
      is_verified: false,
      cooldown_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    try {
      if (realMode) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sesión vencida");
        const { data, error } = await supabase.from("payout_methods").insert({
          user_id: user.id,
          method_type: type,
          label: method.label,
          destination: normalizedDestination,
          holder_name: holder.trim(),
          holder_document: document.replace(/\D/g, ""),
          is_default: methods.length === 0,
        }).select("id,method_type,label,destination_masked,holder_name,holder_document,is_default,is_verified,cooldown_until").single();
        if (error) throw error;
        setMethods((current) => [...current.map((item) => ({ ...item, is_default: method.is_default ? false : item.is_default })), data as Method]);
      } else {
        setMethods((current) => [...current.map((item) => ({ ...item, is_default: method.is_default ? false : item.is_default })), method]);
      }
      setDestination("");
      setHolder("");
      setDocument("");
      setOpen(false);
      setMessage("Método agregado. El primer retiro quedará sujeto a revisión manual.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos agregar el método.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="payout-manager">
      <div className="settings-list payout-method-list">
        {methods.map((method) => {
          const coolingDown = method.cooldown_until && new Date(method.cooldown_until).getTime() > now;
          return (
            <div className={`setting-row static payout-method-row ${method.method_type === "mercado_pago" ? "mercado-pago-row" : ""}`} key={method.id}>
              <span className={`method-icon ${method.method_type === "mercado_pago" ? "mp branded" : "bank"}`}>
                {method.method_type === "mercado_pago" ? <MercadoPagoLogo compact /> : <Icon name="money" size={21}/>}
              </span>
              <span className="setting-copy">
                <strong>
                  {method.label}{method.is_default ? " · Principal" : ""}
                  {method.method_type === "mercado_pago" && <em className="recommended-tag">Recomendado</em>}
                </strong>
                <small>{method.destination_masked} · {method.holder_name || "Titular pendiente"}</small>
                <small className={method.is_verified ? "verified-copy" : "pending-copy"}>
                  {method.is_verified ? "✓ Verificado" : coolingDown ? "Protegido durante 24 h antes del primer retiro" : "Pendiente de verificación"}
                </small>
              </span>
            </div>
          );
        })}
      </div>

      {!methods.length && (
        <div className="empty-state compact">
          <MercadoPagoLogo className="empty-mp-logo" />
          <h3>Agregá Mercado Pago</h3>
          <p>Guardá tu alias o CVU para solicitar retiros cuando tu saldo esté confirmado.</p>
        </div>
      )}

      <button type="button" className="secondary-button button-wide" onClick={() => setOpen(!open)}>
        {open ? "Cancelar" : "Agregar método de retiro"}
      </button>

      {open && (
        <form className="form-stack payout-form" onSubmit={addMethod} noValidate>
          <div className="payout-choice-tabs" role="tablist" aria-label="Tipo de método de retiro">
            <button type="button" className={type === "mercado_pago" ? "active" : ""} onClick={() => setType("mercado_pago")}>
              <MercadoPagoLogo compact />
              <span><strong>Mercado Pago</strong><small>Recomendado para Argentina</small></span>
            </button>
            <button type="button" className={type === "bank_transfer" ? "active" : ""} onClick={() => setType("bank_transfer")}>
              <span className="bank-mini-icon"><Icon name="money" size={18}/></span>
              <span><strong>Transferencia</strong><small>CBU o alias bancario</small></span>
            </button>
          </div>

          <label>
            {type === "mercado_pago" ? "Alias o CVU de Mercado Pago" : "Alias o CBU"}
            <input
              value={destination}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDestination(event.target.value)}
              placeholder={type === "mercado_pago" ? "tu.alias.mp o 22 dígitos" : "alias.bancario o 22 dígitos"}
              autoComplete="off"
              aria-invalid={destination.length > 0 && !destinationValid}
              required
            />
            <small>{destination.length > 0 && !destinationValid ? "Ingresá un alias válido o una cuenta de 22 dígitos." : "Se mostrará enmascarado en la aplicación."}</small>
          </label>

          <label>
            Nombre completo del titular
            <input value={holder} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setHolder(event.target.value)} placeholder="Como figura en la cuenta" required />
          </label>

          <label>
            DNI o CUIL/CUIT del titular
            <input
              value={document}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDocument(event.target.value.replace(/[^0-9-]/g, ""))}
              inputMode="numeric"
              placeholder="Solo para validar el destino"
              aria-invalid={document.length > 0 && !documentValid}
              required
            />
            <small>El documento completo no se muestra en el panel del usuario.</small>
          </label>

          <div className="mp-security-note">
            <span><Icon name="shield" size={18}/></span>
            <div>
              <strong>Protección ante cambios</strong>
              <p>Un destino nuevo queda en revisión durante 24 horas. El primer retiro también se revisa manualmente.</p>
            </div>
          </div>

          <button className="primary-button button-wide" disabled={busy || !formValid}>
            {busy ? "Guardando…" : type === "mercado_pago" ? "Guardar Mercado Pago" : "Guardar transferencia"}
          </button>
          <p className="provider-disclaimer">Mercado Pago es un servicio externo. Su logo se utiliza únicamente para identificar el destino elegido.</p>
        </form>
      )}

      {message && <p className="form-note">{message}</p>}
    </div>
  );
}
