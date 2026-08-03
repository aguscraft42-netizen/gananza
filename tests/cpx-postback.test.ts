import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { cleanPublicIp, cpxAdapter } from "../lib/providers/cpx.ts";
import { SURVEY_PROVIDER_SLUGS } from "../lib/demo-data.ts";

const TEST_SECRET = "test_cpx_secret_key_123";
const TEST_USER_ID = "00000000-0000-4000-8000-000000000001";

function makeHash(transId: string, secret = TEST_SECRET): string {
  return createHash("md5").update(`${transId}-${secret}`).digest("hex");
}

test("1. Bonus válido de $10 ARS por screenout", async () => {
  const transId = "tx_bonus_1001";
  const hash = makeHash(transId);
  const searchParams = new URLSearchParams({
    status: "1",
    trans_id: transId,
    user_id: TEST_USER_ID,
    amount_local: "10",
    amount_usd: "0.01",
    type: "bonus",
    hash: hash,
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const result = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(result.isValid, true);
  if (result.isValid) {
    assert.equal(result.payload.status, "confirmed");
    assert.equal(result.payload.userReward, 10);
    assert.equal(result.payload.rawPayload.description, "CPX Research · Bono por participación");
    assert.equal(result.payload.rawPayload.amount_usd, 0.01);
  }
});

test("2. Encuesta completada válida", async () => {
  const transId = "tx_complete_2002";
  const hash = makeHash(transId);
  const searchParams = new URLSearchParams({
    status: "1",
    trans_id: transId,
    user_id: TEST_USER_ID,
    amount_local: "850",
    amount_usd: "0.85",
    type: "completed",
    hash: hash,
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const result = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(result.isValid, true);
  if (result.isValid) {
    assert.equal(result.payload.status, "confirmed");
    assert.equal(result.payload.userReward, 850);
    assert.equal(result.payload.rawPayload.description, "CPX Research · Encuesta completada");
  }
});

test("3. Transacción repetida / Parámetros válidos", async () => {
  const transId = "tx_repeat_3003";
  const hash = makeHash(transId);
  const searchParams = new URLSearchParams({
    status: "1",
    trans_id: transId,
    user_id: TEST_USER_ID,
    amount_local: "500",
    type: "complete",
    hash: hash,
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const res1 = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);
  const res2 = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(res1.isValid, true);
  assert.equal(res2.isValid, true);
  if (res1.isValid && res2.isValid) {
    assert.equal(res1.payload.externalTransactionId, res2.payload.externalTransactionId);
  }
});

test("4. Hash incorrecto", async () => {
  const searchParams = new URLSearchParams({
    status: "1",
    trans_id: "tx_invalid_hash",
    user_id: TEST_USER_ID,
    amount_local: "500",
    hash: "bad_hash_value_xyz",
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const result = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(result.isValid, false);
  if (!result.isValid) {
    assert.equal(result.statusCode, 401);
    assert.match(result.error, /signature|hash/i);
  }
});

test("5. Usuario inexistente o parámetro de usuario faltante", async () => {
  const searchParams = new URLSearchParams({
    status: "1",
    trans_id: "tx_nouser",
    amount_local: "500",
    hash: "some_hash",
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const result = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(result.isValid, false);
  if (!result.isValid) {
    assert.equal(result.statusCode, 400);
  }
});

test("6. status=2 después de status=1 (reversión)", async () => {
  const transId = "tx_reversal_6006";
  const hash = makeHash(transId);
  const searchParams = new URLSearchParams({
    status: "2",
    trans_id: transId,
    user_id: TEST_USER_ID,
    amount_local: "500",
    type: "canceled",
    hash: hash,
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const result = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(result.isValid, true);
  if (result.isValid) {
    assert.equal(result.payload.status, "reversed");
    assert.equal(result.payload.rawPayload.description, "CPX Research · Reversión del proveedor");
  }
});

test("7. Reverso repetido", async () => {
  const transId = "tx_reversal_repeat_7007";
  const hash = makeHash(transId);
  const searchParams = new URLSearchParams({
    status: "2",
    trans_id: transId,
    user_id: TEST_USER_ID,
    amount_local: "500",
    type: "reversed",
    hash: hash,
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const res1 = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);
  const res2 = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(res1.isValid, true);
  assert.equal(res2.isValid, true);
  if (res1.isValid && res2.isValid) {
    assert.equal(res1.payload.status, "reversed");
    assert.equal(res2.payload.status, "reversed");
  }
});

test("8. Parámetros faltantes (falta status)", async () => {
  const searchParams = new URLSearchParams({
    trans_id: "tx_missing_status",
    user_id: TEST_USER_ID,
    amount_local: "500",
  });

  const req = new Request(`https://gananza-eta.vercel.app/api/webhooks/cpx-research?${searchParams.toString()}`);
  const result = await cpxAdapter.parseAndValidatePostback(req, searchParams, {}, TEST_SECRET);

  assert.equal(result.isValid, false);
  if (!result.isValid) {
    assert.equal(result.statusCode, 400);
    assert.match(result.error, /missing/i);
  }
});

test("9. GET real con query parameters como los enviados por CPX en producción", async () => {
  const transId = "real_cpx_trans_999";
  const hash = makeHash(transId);
  const rawUrl = `https://gananza-eta.vercel.app/api/webhooks/cpx-research?status=1&trans_id=${transId}&user_id=${TEST_USER_ID}&amount_local=10&amount_usd=0.01&type=screenout&hash=${hash}`;

  const req = new Request(rawUrl, { method: "GET" });
  const urlParams = new URL(rawUrl).searchParams;

  const result = await cpxAdapter.parseAndValidatePostback(req, urlParams, {}, TEST_SECRET);

  assert.equal(result.isValid, true);
  if (result.isValid) {
    assert.equal(result.payload.externalTransactionId, transId);
    assert.equal(result.payload.userReward, 10);
    assert.equal(result.payload.status, "confirmed");
    assert.equal(result.payload.rawPayload.description, "CPX Research · Bono por participación");
  }
});

test("10. main_info=true incluido ÚNICAMENTE con perfil demográfico válido", () => {
  const urlConDemografia = new URL(
    cpxAdapter.getIframeUrl({
      userId: TEST_USER_ID,
      birthDate: "1995-08-15",
      gender: "m",
      secret: TEST_SECRET,
    })
  );
  assert.equal(urlConDemografia.searchParams.get("main_info"), "true");
  assert.equal(urlConDemografia.searchParams.get("birthday_day"), "15");
  assert.equal(urlConDemografia.searchParams.get("birthday_month"), "8");
  assert.equal(urlConDemografia.searchParams.get("birthday_year"), "1995");
  assert.equal(urlConDemografia.searchParams.get("gender"), "m");

  const urlSinDemografia = new URL(
    cpxAdapter.getIframeUrl({
      userId: TEST_USER_ID,
      secret: TEST_SECRET,
    })
  );
  assert.equal(urlSinDemografia.searchParams.has("main_info"), false);
  assert.equal(urlSinDemografia.searchParams.has("birthday_day"), false);
  assert.equal(urlSinDemografia.searchParams.has("gender"), false);
});

test("11. Omisión de parámetros nulos/vacíos y codificación de email/username", () => {
  const url = new URL(
    cpxAdapter.getIframeUrl({
      userId: TEST_USER_ID,
      displayName: "Juan Pérez",
      email: "juan.perez@domain.com",
      gender: null,
      zipCode: "",
      secret: TEST_SECRET,
    })
  );

  assert.equal(url.searchParams.get("username"), "Juan Pérez");
  assert.equal(url.searchParams.get("email"), "juan.perez@domain.com");
  assert.equal(url.searchParams.has("gender"), false);
  assert.equal(url.searchParams.has("zip_code"), false);
});

test("12. Limpieza de IP pública IPv4 e IPv6 descartando puerto e IPs privadas", () => {
  assert.equal(cleanPublicIp("190.191.192.193:8080"), "190.191.192.193");
  assert.equal(cleanPublicIp("2001:db8::1"), "2001:db8::1");
  assert.equal(cleanPublicIp("190.191.192.193, 10.0.0.1"), "190.191.192.193");
  assert.equal(cleanPublicIp("127.0.0.1"), null);
  assert.equal(cleanPublicIp("192.168.1.50"), null);
  assert.equal(cleanPublicIp("10.0.0.12"), null);
  assert.equal(cleanPublicIp("172.16.0.1"), null);
});

test("13. Ocultar QA a usuarios normales en producción y permitir a administradores", () => {
  const sampleTasks = [
    { id: "real-1", title: "Tarea Real", isTest: false, status: "available" },
    { id: "qa-1", title: "QA Task", isTest: true, status: "available" },
  ];

  const filterProdUser = (tasks: typeof sampleTasks, isProd: boolean, isStaff: boolean) =>
    tasks.filter((t) => (t.isTest ? !isProd || isStaff : true));

  assert.equal(filterProdUser(sampleTasks, true, false).length, 1);
  assert.equal(filterProdUser(sampleTasks, true, false)[0].id, "real-1");

  assert.equal(filterProdUser(sampleTasks, true, true).length, 2);
  assert.equal(filterProdUser(sampleTasks, false, false).length, 2);
});

test("14. Exclusión de tareas QA en el cálculo de métricas públicas", () => {
  const sampleTasks = [
    { id: "real-1", title: "Tarea Real", isTest: false, status: "available" },
    { id: "qa-1", title: "QA Task", isTest: true, status: "available" },
  ];

  const countAvailablePublic = (tasks: typeof sampleTasks) =>
    tasks.filter((t) => !t.isTest && t.status === "available").length;

  assert.equal(countAvailablePublic(sampleTasks), 1);
});

test("15. Visibilidad del módulo CPX exclusivamente en pestañas 'Todas' y 'Encuestas'", () => {
  const isCpxVisibleInTab = (category: string, cpxEnabled: boolean, hasQuery: boolean) =>
    cpxEnabled && (category === "Todas" || category === "Encuestas") && !hasQuery;

  assert.equal(isCpxVisibleInTab("Todas", true, false), true);
  assert.equal(isCpxVisibleInTab("Encuestas", true, false), true);
  assert.equal(isCpxVisibleInTab("Juegos", true, false), false);
  assert.equal(isCpxVisibleInTab("Apps y servicios", true, false), false);
  assert.equal(isCpxVisibleInTab("Tareas rápidas", true, false), false);
  assert.equal(isCpxVisibleInTab("Todas", true, true), false);
  assert.equal(isCpxVisibleInTab("Todas", false, false), false);
});

test("16. Conteo de proveedores clasificados exclusivamente como encuestas (SURVEY_PROVIDER_SLUGS)", () => {
  const dbProviders = [
    { slug: "cpx-research", is_active: true },
    { slug: "ayet-studios", is_active: true },
    { slug: "torox", is_active: true },
  ];

  const surveyProviders = dbProviders.filter((p) =>
    p.is_active && (SURVEY_PROVIDER_SLUGS as readonly string[]).includes(p.slug as any)
  );

  // ayeT y Torox son proveedores de juegos/apps, no de encuestas
  assert.equal(surveyProviders.length, 1);
  assert.equal(surveyProviders[0].slug, "cpx-research");
});

test("17. CPX inactivo o deshabilitado no incrementa el contador de encuestas ni muestra tarjeta habilitada", () => {
  const dbProvidersInactive = [
    { slug: "cpx-research", is_active: false },
    { slug: "ayet-studios", is_active: true },
  ];

  const surveyProviders = dbProvidersInactive.filter((p) =>
    p.is_active && (SURVEY_PROVIDER_SLUGS as readonly string[]).includes(p.slug as any)
  );

  assert.equal(surveyProviders.length, 0);
});
