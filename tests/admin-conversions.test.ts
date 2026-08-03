import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAdminConversionsList,
  getAdminConversionDetail,
} from "../lib/gananza/admin-conversions.ts";

test("1. Listado de conversiones con importes USD, montos locales e información de proveedor", async () => {
  const conversions = await getAdminConversionsList({ status: "all" });
  assert.ok(conversions.length > 0, "Debe devolver conversiones");

  const item = conversions[0];
  assert.ok(item.externalTransactionId, "Debe incluir ID externo");
  assert.ok(item.providerName, "Debe incluir nombre de proveedor");
  assert.equal(typeof item.amountUsd, "number");
  assert.equal(typeof item.payoutAmountLocal, "number");
});

test("2. Filtrado por proveedor y por estado (confirmadas, pendientes, revertidas)", async () => {
  const cpxConversions = await getAdminConversionsList({ provider: "cpx-research" });
  assert.ok(
    cpxConversions.every((c) => c.providerSlug === "cpx-research"),
    "Todas las conversiones deben pertenecer a CPX Research"
  );

  const confirmedConversions = await getAdminConversionsList({ status: "confirmed" });
  assert.ok(
    confirmedConversions.every((c) => c.status === "confirmed"),
    "Todas las conversiones filtradas deben tener estado 'confirmed'"
  );

  const reversedConversions = await getAdminConversionsList({ status: "reversed" });
  assert.ok(
    reversedConversions.every((c) => c.status === "reversed"),
    "Todas las conversiones deben tener estado 'reversed'"
  );
});

test("3. Búsqueda por nombre de usuario, email o ID externo de transacción", async () => {
  const searchResult = await getAdminConversionsList({ query: "CPX-TX-998124" });
  assert.ok(searchResult.length > 0, "Debe encontrar la conversión por ID externo");
  assert.equal(searchResult[0].externalTransactionId, "CPX-TX-998124");
});

test("4. Consulta de detalle de conversión con payload raw y movimiento de ledger vinculado", async () => {
  const detail = await getAdminConversionDetail("conv-101");
  assert.ok(detail, "Debe devolver el detalle de la conversión");
  assert.ok(detail.rawPayload, "Debe incluir el payload raw enviado por el proveedor");
  assert.ok(detail.ledgerEntry, "Debe estar vinculada al movimiento del ledger");
  assert.equal(detail.ledgerEntry.entryType, "reward_confirmed");
});
