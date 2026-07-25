export const ACCOUNT_ROLES = Object.freeze(["agency", "client"]);

const BLOCKED_PASSWORDS = new Set([
  "password",
  "password123",
  "change-me",
  "changeme",
  "klyselz",
  "klyselz123",
  "123456789012345",
]);

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateEmail(value) {
  const email = normalizeEmail(value);
  const [local = ""] = email.split("@");
  const valid =
    email.length >= 3 &&
    email.length <= 254 &&
    local.length <= 64 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email);

  return valid
    ? { ok: true, value: email }
    : { ok: false, error: "Enter a valid email address." };
}

export function validatePassword(value) {
  if (typeof value !== "string") {
    return { ok: false, error: "Password is required." };
  }
  if (value.length < 15) {
    return { ok: false, error: "Password must contain at least 15 characters." };
  }
  if (value.length > 128) {
    return { ok: false, error: "Password must contain at most 128 characters." };
  }
  if (new TextEncoder().encode(value).byteLength > 72) {
    return { ok: false, error: "Password exceeds bcrypt's 72-byte limit." };
  }
  if (BLOCKED_PASSWORDS.has(value.trim().toLowerCase())) {
    return { ok: false, error: "Choose a password that is not commonly used." };
  }
  return { ok: true, value };
}

export function validateLoginInput(input) {
  const email = validateEmail(input?.email);
  const password = typeof input?.password === "string" ? input.password : "";
  if (!email.ok || !password || password.length > 256) {
    return { ok: false, error: "Invalid email or password input." };
  }
  return { ok: true, value: { email: email.value, password } };
}

export function validateProvisioningInput(input) {
  const email = validateEmail(input?.email);
  if (!email.ok) return email;

  const password = validatePassword(input?.password);
  if (!password.ok) return password;

  const role = typeof input?.role === "string" ? input.role.trim().toLowerCase() : "";
  if (!ACCOUNT_ROLES.includes(role)) {
    return { ok: false, error: "Role must be agency or client." };
  }

  const clientName = typeof input?.clientName === "string" ? input.clientName.trim() : "";
  if (role === "client" && (clientName.length < 2 || clientName.length > 120)) {
    return { ok: false, error: "Client accounts require a client name between 2 and 120 characters." };
  }
  if (role === "agency" && clientName) {
    return { ok: false, error: "Agency accounts cannot be assigned to a client." };
  }

  return {
    ok: true,
    value: {
      email: email.value,
      password: password.value,
      role,
      clientName: role === "client" ? clientName : null,
    },
  };
}
