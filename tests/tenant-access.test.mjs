import assert from "node:assert/strict";
import test from "node:test";
import { getTenantReadScope } from "../apps/client-dashboard/lib/tenant-access.mjs";

test("agency read scope can access agency-wide views", () => {
  assert.deepEqual(getTenantReadScope({ role: "agency", clientId: null }), {
    kind: "agency",
  });
});

test("client read scope is fixed to its positive tenant id", () => {
  assert.deepEqual(getTenantReadScope({ role: "client", clientId: 42 }), {
    kind: "client",
    clientId: 42,
  });
});

test("client read scope fails closed without a valid tenant", () => {
  assert.equal(getTenantReadScope({ role: "client", clientId: null }), null);
  assert.equal(getTenantReadScope({ role: "client", clientId: 0 }), null);
  assert.equal(getTenantReadScope({ role: "client", clientId: -1 }), null);
  assert.equal(getTenantReadScope({ role: "client", clientId: "invalid" }), null);
});

test("unknown roles fail closed", () => {
  assert.equal(getTenantReadScope({ role: "owner", clientId: 42 }), null);
  assert.equal(getTenantReadScope(null), null);
});
