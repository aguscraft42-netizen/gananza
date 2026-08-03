import assert from "node:assert/strict";
import { test } from "node:test";
import { getAdminRiskUsers } from "../lib/gananza/admin-risk.ts";

test("1. Detección de usuarios con señales de riesgo y cálculo de nivel de riesgo", async () => {
  const users = await getAdminRiskUsers({ riskLevel: "all" });
  assert.ok(users.length > 0, "Debe devolver usuarios con banderas de riesgo");

  const highRisk = users.find((u) => u.riskLevel === "high");
  assert.ok(highRisk, "Debe existir al menos un usuario clasificado como riesgo alto");
  assert.ok(highRisk.signals.length > 0, "El usuario debe tener señales asociadas");
});

test("2. Filtrado por nivel de riesgo (alto, medio, bajo) y por código de señal", async () => {
  const highOnly = await getAdminRiskUsers({ riskLevel: "high" });
  assert.ok(
    highOnly.every((u) => u.riskLevel === "high"),
    "Todos los usuarios filtrados deben tener riesgo alto"
  );

  const sharedDestOnly = await getAdminRiskUsers({ signalCode: "shared_payout_destination" });
  assert.ok(
    sharedDestOnly.every((u) => u.signals.some((s) => s.code === "shared_payout_destination")),
    "Todos los usuarios filtrados deben tener la señal 'shared_payout_destination'"
  );
});

test("3. Presencia de motivos concretos y fecha de última señal detectada", async () => {
  const users = await getAdminRiskUsers();
  const sample = users[0];

  assert.ok(sample.userId, "Debe incluir el UUID de usuario para vinculación con /admin/usuarios/[id]");
  assert.ok(sample.lastSignalAt, "Debe incluir la fecha de la última señal detectada");
  assert.ok(sample.signals[0].title, "Las señales deben tener título explicativo");
  assert.ok(sample.signals[0].description, "Las señales deben tener descripción cuantitativa concreta");
});
