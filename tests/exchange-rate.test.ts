import assert from "node:assert/strict";
import { test } from "node:test";
import { getCurrentExchangeRate, updateExchangeRate } from "../lib/gananza/exchange-rate.ts";

const ADMIN_USER_ID = "00000000-0000-4000-8000-000000000001";
const NORMAL_USER_ID = "00000000-0000-4000-8000-000000000002";

test("1. getCurrentExchangeRate devuelve objeto válido con campos requeridos", async () => {
  const current = await getCurrentExchangeRate();
  assert.ok(typeof current.fxRateArsUsd === "number");
  assert.ok(current.fxRateArsUsd > 0);
  assert.ok(typeof current.fxSource === "string");
  assert.ok(typeof current.fxEffectiveAt === "string");
  assert.ok(typeof current.updatedAt === "string");
});

test("2. updateExchangeRate deniega acceso a usuarios sin rol de administrador", async () => {
  const result = await updateExchangeRate({
    rate: 1350.0,
    source: "Manual Admin",
    reason: "Intento de actualización por usuario común",
    userId: NORMAL_USER_ID,
    userRoles: ["user"],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /administradores/i);
  }
});

test("3. updateExchangeRate rechaza cotizaciones no numéricas, cero o negativas", async () => {
  const res1 = await updateExchangeRate({
    rate: 0,
    reason: "Cotización cero",
    userId: ADMIN_USER_ID,
    userRoles: ["admin"],
  });
  assert.equal(res1.success, false);

  const res2 = await updateExchangeRate({
    rate: -500,
    reason: "Cotización negativa",
    userId: ADMIN_USER_ID,
    userRoles: ["admin"],
  });
  assert.equal(res2.success, false);

  const res3 = await updateExchangeRate({
    rate: Number.NaN,
    reason: "Cotización NaN",
    userId: ADMIN_USER_ID,
    userRoles: ["admin"],
  });
  assert.equal(res3.success, false);
});

test("4. updateExchangeRate rechaza actualizaciones con motivo vacío", async () => {
  const result = await updateExchangeRate({
    rate: 1300.0,
    reason: "   ",
    userId: ADMIN_USER_ID,
    userRoles: ["admin"],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /motivo/i);
  }
});

test("5. updateExchangeRate permite actualizar correctamente a un administrador con motivo válido", async () => {
  const newRate = 1385.5;
  const reason = "Ajuste oficial por inflación mensual";

  const result = await updateExchangeRate({
    rate: newRate,
    source: "Dólar MEP Oficial",
    reason: reason,
    userId: ADMIN_USER_ID,
    userRoles: ["admin"],
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.fxRateArsUsd, newRate);
    assert.equal(result.data.fxSource, "Dólar MEP Oficial");
  }
});
