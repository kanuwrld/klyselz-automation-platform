export type AccountRole = "agency" | "client";
export type ValidationFailure = { ok: false; error: string };

export const ACCOUNT_ROLES: readonly AccountRole[];
export function normalizeEmail(value: unknown): string;
export function validateEmail(
  value: unknown
): { ok: true; value: string } | ValidationFailure;
export function validatePassword(
  value: unknown
): { ok: true; value: string } | ValidationFailure;
export function validateLoginInput(
  input: { email?: unknown; password?: unknown } | null | undefined
):
  | { ok: true; value: { email: string; password: string } }
  | ValidationFailure;
export function validateProvisioningInput(
  input:
    | { email?: unknown; password?: unknown; role?: unknown; clientName?: unknown }
    | null
    | undefined
):
  | {
      ok: true;
      value: {
        email: string;
        password: string;
        role: AccountRole;
        clientName: string | null;
      };
    }
  | ValidationFailure;
