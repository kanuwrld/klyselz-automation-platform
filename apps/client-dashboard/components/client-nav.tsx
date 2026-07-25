"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LifeBuoy } from "lucide-react";

const items = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  { href: "/tickets", label: "Support", icon: LifeBuoy },
];

export function ClientNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Kunden-Navigation" className="mb-8 inline-flex rounded-xl border bg-card p-1.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
              active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
