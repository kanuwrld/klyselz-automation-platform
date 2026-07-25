"use client";

import { useRouter } from "next/navigation";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
      <button
        onClick={logout}
        className="rounded-md border border-foreground/20 px-3 py-1.5 text-xs transition-colors hover:bg-foreground hover:text-background"
      >
        Abmelden
      </button>
    </div>
  );
}
