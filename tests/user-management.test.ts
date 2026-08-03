import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAdminUsersList,
  getAdminUserDetail,
  updateUserStatus,
} from "../lib/gananza/user-management.ts";

test("1. Listado de usuarios con filtros por estado y búsqueda por query", async () => {
  const allUsers = await getAdminUsersList({ status: "all" });
  assert.ok(allUsers.length > 0, "Debe devolver usuarios");

  const activeUsers = await getAdminUsersList({ status: "active" });
  assert.ok(
    activeUsers.every((u) => !u.suspendedAt),
    "Todos los usuarios en filtro 'active' no deben tener suspendedAt"
  );

  const suspendedUsers = await getAdminUsersList({ status: "suspended" });
  assert.ok(
    suspendedUsers.every((u) => Boolean(u.suspendedAt)),
    "Todos los usuarios en filtro 'suspended' deben estar suspendidos"
  );

  const searched = await getAdminUsersList({ query: "Lucía" });
  assert.ok(searched.length > 0, "Debe encontrar a Lucía por búsqueda parcial de nombre");
});

test("2. Detalle completo de usuario con saldos, nivel, conversiones e historial", async () => {
  const detail = await getAdminUserDetail("00000000-0000-4000-8000-000000000001");
  assert.ok(detail, "Debe devolver el objeto de detalle del usuario");
  assert.equal(typeof detail.availableBalance, "number");
  assert.equal(typeof detail.riskScore, "number");
  assert.ok(Array.isArray(detail.ledgerEntries), "Debe incluir arreglo del ledger");
  assert.ok(Array.isArray(detail.auditHistory), "Debe incluir arreglo de historial de auditoría");
});

test("3. Suspensión de cuenta requiere motivo obligatorio y se registra en auditoría", async () => {
  const targetId = "00000000-0000-4000-8000-000000000003";

  // Intento de suspender sin motivo debe fallar
  const failRes = await updateUserStatus(targetId, "suspend", "   ");
  assert.equal(failRes.ok, false);
  assert.match(failRes.error || "", /motivo/i);

  // Suspensión con motivo válido
  const reason = "Violación de términos y condiciones por multicuentas";
  const okRes = await updateUserStatus(targetId, "suspend", reason, "admin-test-id");
  assert.equal(okRes.ok, true);

  const updatedDetail = await getAdminUserDetail(targetId);
  assert.ok(updatedDetail?.suspendedAt, "La cuenta debe figurar suspendida");
  assert.equal(updatedDetail?.suspensionReason, reason);

  const lastAudit = updatedDetail?.auditHistory[0];
  assert.equal(lastAudit?.action, "user_suspended");
  assert.equal(lastAudit?.note, reason);
});

test("4. Reactivación de cuenta limpia suspensión y genera entrada en auditoría", async () => {
  const targetId = "00000000-0000-4000-8000-000000000002";

  const okRes = await updateUserStatus(targetId, "reactivate", undefined, "admin-test-id");
  assert.equal(okRes.ok, true);

  const updatedDetail = await getAdminUserDetail(targetId);
  assert.equal(updatedDetail?.suspendedAt, null, "La cuenta ya no debe figurar suspendida");
  assert.equal(updatedDetail?.suspensionReason, null);

  const lastAudit = updatedDetail?.auditHistory[0];
  assert.equal(lastAudit?.action, "user_reactivated");
});
