// Optional Telegram operator notification.
// TELEGRAM_CHAT_ID accepts a comma-separated allowlist.
// Missing configuration is a no-op and never logs contact payloads.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHATS = (process.env.TELEGRAM_CHAT_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const hasTelegram = !!TOKEN && CHATS.length > 0;

async function sendRaw(chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`telegram ${res.status}: ${body.slice(0, 200)}`);
  }
}

async function send(text: string) {
  if (!hasTelegram) {
    return;
  }
  await Promise.all(
    CHATS.map((c) =>
      sendRaw(c, text).catch((e) => console.warn("[telegram]", c, e))
    )
  );
}

function esc(s: string | null | undefined) {
  if (!s) return "—";
  return String(s).replace(/[&<>]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"
  );
}

export async function notifyTgLead(email: string, source: string) {
  const isWaitlist = source === "waitlist" || source === "hero";
  const header = isWaitlist ? "📝 <b>Neue Warteliste-Anmeldung</b>" : "🟢 <b>Neuer Lead</b>";
  const text = [
    header,
    `<b>E-Mail:</b> <code>${esc(email)}</code>`,
    `<b>Source:</b> ${esc(source)}`,
  ].join("\n");
  return send(text);
}

export async function notifyTgContact(p: {
  business: string;
  contact: string;
  message: string | null;
}) {
  const text = [
    `📩 <b>Anfrage über Website</b>`,
    `<b>Betrieb:</b> ${esc(p.business)}`,
    `<b>Kontakt:</b> ${esc(p.contact)}`,
    `<b>Nachricht:</b>\n${esc(p.message ?? "—")}`,
  ].join("\n");
  return send(text);
}

export async function notifyTgQualified(p: {
  email: string;
  business: string;
  niche: string;
  goal: string;
}) {
  const text = [
    `✅ <b>Qualified Lead · Brief ausgefüllt</b>`,
    `<b>Betrieb:</b> ${esc(p.business)}`,
    `<b>E-Mail:</b> ${esc(p.email)}`,
    `<b>Nische:</b> ${esc(p.niche)}`,
    `<b>Ziel:</b>\n${esc(p.goal)}`,
  ].join("\n");
  return send(text);
}
