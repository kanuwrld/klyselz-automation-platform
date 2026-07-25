export function textField(value: unknown, max = 500) {
  if (value == null) return null;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

export function emailOrPhoneLike(value: string) {
  return /@/.test(value) || /\+?\d[\d\s().-]{5,}/.test(value);
}
