"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, CheckSquare2, CircleDollarSign, Inbox, LifeBuoy, Users } from "lucide-react";

const items = [
  { href: "/", label: "Anfragen", icon: Inbox },
  { href: "/clients", label: "Kunden", icon: Users },
  { href: "/projects", label: "Projekte", icon: BriefcaseBusiness },
  { href: "/tasks", label: "Aufgaben", icon: CheckSquare2 },
  { href: "/finance", label: "Finanzen", icon: CircleDollarSign },
  { href: "/tickets", label: "Tickets", icon: LifeBuoy },
  { href: "/prospects", label: "Pipeline", icon: BarChart3 },
];

export function AgencyNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Agentur-Navigation" className="mb-8 overflow-x-auto rounded-xl border bg-card p-1.5">
      <div className="flex min-w-max items-center gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
