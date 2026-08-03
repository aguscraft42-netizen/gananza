import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getWithdrawalRules,
  updateWithdrawalRules,
  validateWithdrawalRequest,
} from "../lib/gananza/withdrawal-rules.ts";

const ADMIN_USER_ID = "00000000-0000-4000-8000-000000000001";
const NORMAL_USER_ID = "00000000-0000-4000-8000-000000000002";

test("1. Mínimo Mercado Pago: permite $5.000 ARS y rechaza menos de $5.000 ARS", async () => {
  const validMp = await validateWithdrawalRequest({
    userId: NORMAL_USER_ID,
    amount: 5000,
    methodType: "mercado_pago",
    availableBalance: 10000,
  });
  assert.equal(validMp.isValid, true);

  const invalidMp = await validateWithdrawalRequest({
    userId: NORMAL_USER_ID,
    amount: 4999,
    methodType: "mercado_pago",
    availableBalance: 10000,
  });
  assert.equal(invalidMp.isValid, false);
  if (!invalidMp.isValid) {
    assert.match(invalidMp.error || "", /Mercado Pago|5\.000/i);
  }
});

test("2. Mínimo Transferencia: permite $10.000 ARS y rechaza menos de $10.000 ARS", async () => {
  const validBank = await validateWithdrawalRequest({
    userId: NORMAL_USER_ID,
    amount: 10000,
    methodType: "other_bank",
    availableBalance: 15000,
  });
  assert.equal(validBank.isValid, true);

  const invalidBank = await validateWithdrawalRequest({
    userId: NORMAL_USER_ID,
    amount: 8000,
    methodType: "other_bank",
    availableBalance: 15000,
  });
  assert.equal(invalidBank.isValid, false);
  if (!invalidBank.isValid) {
    assert.match(invalidBank.error || "", /banco|10\.000/i);
  }
});

test("3. Saldo insuficiente: rechaza si el monto solicitado supera el saldo disponible", async () => {
  const result = await validateWithdrawalRequest({
    userId: NORMAL_USER_ID,
    amount: 7000,
    methodType: "mercado_pago",
    availableBalance: 5000,
  });
  assert.equal(result.isValid, false);
  if (!result.isValid) {
    assert.match(result.error || "", /insuficiente/i);
  }
});

test("4. Usuario habilitado correctamente cuando cumple con todas las reglas", async () => {
  const result = await validateWithdrawalRequest({
    userId: NORMAL_USER_ID,
    amount: 6000,
    methodType: "mercado_pago",
    availableBalance: 12000,
  });
  assert.equal(result.isValid, true);
});

test("5. Cambio administrativo auditado deniega no administradores y acepta actualización válida", async () => {
  const nonAdminRes = await updateWithdrawalRules({
    minMercadoPago: 6000,
    minBankTransfer: 12000,
    cooldownDays: 5,
    maxActiveRequests: 1,
    reason: "Ajuste no autorizado",
    userId: NORMAL_USER_ID,
    userRoles: ["user"],
  });
  assert.equal(nonAdminRes.success, false);
  if (!nonAdminRes.success) {
    assert.match(nonAdminRes.error, /administradores/i);
  }

  const adminRes = await updateWithdrawalRules({
    minMercadoPago: 5500,
    minBankTransfer: 11000,
    cooldownDays: 7,
    maxActiveRequests: 1,
    reason: "Ajuste de política por liquidez",
    userId: ADMIN_USER_ID,
    userRoles: ["admin"],
  });
  assert.equal(adminRes.success, true);
  if (adminRes.success) {
    assert.equal(adminRes.data.minAmountMercadoPago, 5500);
    assert.equal(adminRes.data.minAmountBankTransfer, 11000);
  }
});
