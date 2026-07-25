import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  normalizeEmail,
  validateEmail,
  validateLoginInput,
  validatePassword,
  validateProvisioningInput,
} from "../apps/owner-admin/lib/account-policy.mjs";

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  Owner@Example.COM "), "owner@example.com");
  assert.equal(validateEmail("owner@example.com").ok, true);
  assert.equal(validateEmail("not-an-email").ok, false);
});

test("enforces provisioning password policy", () => {
  assert.equal(validatePassword("too-short").ok, false);
  assert.equal(validatePassword("river-stone-owl").ok, true);
  assert.equal(validatePassword("🔐".repeat(19)).ok, false);
});

test("requires tenant assignment for client accounts", () => {
  assert.equal(
    validateProvisioningInput({
      email: "owner@example.com",
      password: "river-stone-owl",
      role: "client",
    }).ok,
    false
  );

  const valid = validateProvisioningInput({
    email: "owner@example.com",
    password: "river-stone-owl",
    role: "client",
    clientName: "Example GmbH",
  });
  assert.equal(valid.ok, true);
  if (valid.ok) assert.equal(valid.value.clientName, "Example GmbH");
});

test("rejects malformed login payloads before database access", () => {
  assert.equal(validateLoginInput({ email: "broken", password: "x" }).ok, false);
  assert.equal(
    validateLoginInput({ email: "owner@example.com", password: "x" }).ok,
    true
  );
});

test("owner and client dashboards share identical account policy", async () => {
  const ownerPolicy = await readFile(
    new URL("../apps/owner-admin/lib/account-policy.mjs", import.meta.url),
    "utf8"
  );
  const clientPolicy = await readFile(
    new URL("../apps/client-dashboard/lib/account-policy.mjs", import.meta.url),
    "utf8"
  );
  assert.equal(clientPolicy, ownerPolicy);
});
