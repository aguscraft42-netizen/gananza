# Contrato genérico de webhook — Gananza V5

Este contrato sirve únicamente para desarrollo y para demostrar el flujo. La integración final debe seguir la documentación exacta de la red aprobada.

## Endpoint

```text
POST /api/webhooks/{provider-slug}
```

## Encabezados

```text
content-type: application/json
x-event-id: identificador-unico-del-evento
x-gananza-signature: sha256=HEX_HMAC
```

La firma se calcula con HMAC SHA-256 sobre el cuerpo JSON crudo.

## Cuerpo

```json
{
  "transaction_id": "provider-transaction-001",
  "user_id": "UUID_DEL_USUARIO",
  "offer_id": "UUID_DE_LA_OFERTA",
  "status": "pending",
  "gross_amount": 7000,
  "user_reward": 4200,
  "metadata": {}
}
```

Estados aceptados:

- `pending`
- `confirmed`
- `rejected`
- `reversed`

## Respuesta exitosa

```json
{
  "ok": true,
  "conversion": {}
}
```

## Idempotencia

- `x-event-id` identifica el envío HTTP.
- `transaction_id` identifica la conversión comercial.
- Repetir cualquiera de los dos no debe acreditar dos veces.

## Ejemplo para generar firma en Node.js

```js
import { createHmac } from "node:crypto";

const body = JSON.stringify(payload);
const signature = createHmac("sha256", secret).update(body).digest("hex");
```

## Adaptaciones esperadas por proveedor

- Nombre del encabezado de firma.
- Algoritmo de firma.
- Codificación hexadecimal o Base64.
- Identificador del usuario o sub-ID.
- Estados y eventos parciales.
- Moneda y formato de importes.
- Reintentos y tiempo de respuesta exigido.
