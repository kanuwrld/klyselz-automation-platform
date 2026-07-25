import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
const configuredFrom = process.env.RESEND_FROM;
export const hasResend = !!key && !!configuredFrom;
const client = hasResend ? new Resend(key) : null;

const FROM = configuredFrom ?? "KLYSELZ <hello@example.com>";
const OWNER = process.env.OWNER_EMAIL;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://klyselz.com";

type SendArgs = { to: string; subject: string; html: string; replyTo?: string };

export async function send({ to, subject, html, replyTo }: SendArgs) {
  if (!client) {
    return { id: "disabled", demo: true };
  }
  const res = await client.emails.send({ from: FROM, to, subject, html, replyTo });
  if (res.error) throw new Error(res.error.message);
  return { id: res.data?.id ?? "" };
}

export async function sendWelcome(email: string) {
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#0a0a0a;">
      <h1 style="font-size:22px;margin:0 0 16px;font-weight:800;letter-spacing:-0.01em;">Willkommen bei KLYSELZ</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Danke, dass du deine E-Mail hinterlassen hast. Wir zeigen dir in den nächsten Tagen, wie ein KI-Assistent Anfragen rund um die Uhr für dich beantwortet — auf Deutsch, im Ton deiner Marke.</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">Willst du direkt eine Demo? <a href="${SITE}/#kontakt" style="color:#0a0a0a;font-weight:600;">Antworte einfach auf diese Mail.</a></p>
      <p style="font-size:13px;color:#666;margin:24px 0 0;border-top:1px solid #eee;padding-top:16px;">KLYSELZ · KI-Automatisierung für lokale Betriebe · <a href="${SITE}" style="color:#666;">klyselz.com</a></p>
    </div>`;
  return send({ to: email, subject: "Willkommen bei KLYSELZ", html });
}

export async function sendBriefLink(email: string, token: string) {
  const link = `${SITE}/brief/${encodeURIComponent(token)}`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#0a0a0a;">
      <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 20px;font-weight:800;">KLYSELZ</p>
      <h1 style="font-size:24px;margin:0 0 16px;font-weight:800;">Kurzer Brief für deine Demo</h1>
      <p style="font-size:15px;line-height:1.65;margin:0 0 18px;">Danke für dein Interesse. Damit wir verstehen, wie dein Betrieb arbeitet und wo Anfragen verloren gehen, füll bitte den kurzen Brief aus.</p>
      <p style="font-size:15px;line-height:1.65;margin:0 0 24px;">Danach können wir dir eine passendere Demo zeigen — nicht generisch, sondern mit deinem Geschäft im Blick.</p>
      <p style="margin:32px 0;">
        <a href="${link}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;border-radius:6px;padding:13px 18px;font-size:15px;font-weight:700;">Brief ausfüllen</a>
      </p>
      <p style="font-size:13px;color:#666;line-height:1.5;">Der Link ist persönlich und nur einmal nutzbar. Falls der Button nicht funktioniert: <br><a href="${link}" style="color:#0a0a0a;">${link}</a></p>
      <p style="font-size:13px;color:#666;margin:28px 0 0;border-top:1px solid #eee;padding-top:16px;">KLYSELZ · KI-Automatisierung für lokale Betriebe · <a href="${SITE}" style="color:#666;">klyselz.com</a></p>
    </div>`;
  return send({ to: email, subject: "Dein KLYSELZ Brief", html });
}

export async function notifyOwnerQualified(payload: { email: string; business: string; niche: string; goal: string }) {
  if (!OWNER) return { id: "disabled", demo: true };
  const html = `
    <h2 style="margin:0 0 8px;">Brief ausgefüllt</h2>
    <p><b>E-Mail:</b> ${escape(payload.email)}</p>
    <p><b>Betrieb:</b> ${escape(payload.business)}</p>
    <p><b>Nische:</b> ${escape(payload.niche)}</p>
    <p><b>Ziel:</b><br>${escape(payload.goal).replace(/\n/g, "<br>")}</p>`;
  return send({ to: OWNER, subject: `Qualified Lead · ${payload.business}`, html, replyTo: payload.email });
}

export async function notifyOwnerLead(email: string, source: string) {
  if (!OWNER) return { id: "disabled", demo: true };
  const html = `<p><b>Neuer Lead:</b> ${escape(email)}</p><p>Source: ${escape(source)}</p>`;
  return send({ to: OWNER, subject: `Neuer Lead: ${email}`, html, replyTo: email });
}

export async function notifyOwnerContact(payload: { business: string; contact: string; message: string | null }) {
  if (!OWNER) return { id: "disabled", demo: true };
  const html = `
    <h2 style="margin:0 0 8px;">Neue Anfrage über die Website</h2>
    <p><b>Betrieb:</b> ${escape(payload.business)}</p>
    <p><b>Kontakt:</b> ${escape(payload.contact)}</p>
    <p><b>Nachricht:</b><br>${escape(payload.message ?? "—").replace(/\n/g, "<br>")}</p>`;
  return send({ to: OWNER, subject: `KLYSELZ · Anfrage von ${payload.business}`, html, replyTo: payload.contact.includes("@") ? payload.contact : undefined });
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
