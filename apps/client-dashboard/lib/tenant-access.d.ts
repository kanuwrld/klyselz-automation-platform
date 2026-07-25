export type TenantReadScope =
  | { kind: "agency" }
  | { kind: "client"; clientId: number };

export function getTenantReadScope(
  session:
    | { role?: unknown; clientId?: unknown }
    | null
    | undefined
): TenantReadScope | null;
