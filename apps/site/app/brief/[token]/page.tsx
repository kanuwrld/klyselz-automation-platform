import Link from "next/link";
import { BriefForm } from "@/components/brief-form";
import { getInboundLeadByToken } from "@/lib/brief";

export const dynamic = "force-dynamic";

export default async function BriefPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lead = await getInboundLeadByToken(token);

  if (!lead) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16">
        <Link href="/" className="mb-8 text-sm text-muted-foreground hover:text-foreground">← KLYSELZ</Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Link ungültig oder abgelaufen.</h1>
        <p className="mt-4 text-muted-foreground">
          Der Brief-Link ist persönlich und nur einmal nutzbar. Bitte hinterlasse deine E-Mail erneut, damit wir dir einen neuen Link senden.
        </p>
        <Link href="/#kontakt" className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground">
          Neuen Link anfragen
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link href="/" className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground">← KLYSELZ</Link>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Persönlicher Brief</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
          Damit deine Demo zu deinem Geschäft passt.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Kurze Fragen zu Betrieb, Kanälen, Problemen und Ziel. Nach dem Absenden wechselt dein Status in unserer Admin-CRM auf qualified.
        </p>
      </div>
      <BriefForm token={token} email={lead.email} business={lead.business} />
    </main>
  );
}
