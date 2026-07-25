export function getTenantReadScope(session) {
  if (session?.role === "agency") {
    return { kind: "agency" };
  }
  const clientId = Number(session?.clientId);
  if (session?.role === "client" && Number.isSafeInteger(clientId) && clientId > 0) {
    return { kind: "client", clientId };
  }
  return null;
}
