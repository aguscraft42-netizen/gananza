import assert from "node:assert/strict";
import { test } from "node:test";
import { getAdminFinancials } from "../lib/gananza/admin-finances.ts";

test("1. Cálculo exacto de la obligación total actual (disponible + pendiente + retenido)", async () => {
  const data = await getAdminFinancials();
  const { summary } = data;

  const expectedObligation =
    summary.totalAvailableBalance +
    summary.totalPendingBalance +
    summary.totalHeldBalance;

  assert.equal(
    summary.totalCurrentObligation,
    expectedObligation,
    "La obligación actual debe ser estrictamente igual a disponible + pendiente + retenido"
  );
});

test("2. Resúmenes de rangos temporales (7, 30 y 90 días)", async () => {
  const data = await getAdminFinancials();
  const { timeframes } = data;

  assert.equal(timeframes.length, 3, "Debe retornar resúmenes para 7, 30 y 90 días");
  assert.equal(timeframes[0].days, 7);
  assert.equal(timeframes[1].days, 30);
  assert.equal(timeframes[2].days, 90);
});

test("3. Cálculo de ingresos brutos, recompensas y margen estimado o datos insuficientes", async () => {
  const data = await getAdminFinancials();
  const { summary } = data;

  assert.equal(typeof summary.grossProviderRevenue, "number");
  assert.equal(typeof summary.userRewardsCredited, "number");

  if (summary.grossProviderRevenue > 0) {
    assert.equal(
      summary.estimatedMarginAmount,
      summary.grossProviderRevenue - summary.userRewardsCredited
    );
  } else {
    assert.equal(summary.estimatedMarginAmount, null);
    assert.equal(summary.estimatedMarginPercentage, null);
  }
});

test("4. Tipo de cambio ARS/USD vigente y fecha de actualización", async () => {
  const data = await getAdminFinancials();
  const { summary } = data;

  assert.ok(summary.fxRateArsUsd > 0, "Cotización debe ser mayor que 0");
  assert.ok(summary.fxEffectiveAt, "Debe retornar la fecha de vigencia de la cotización");
});
