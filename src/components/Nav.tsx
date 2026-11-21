"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Home" },
  { href: "/app/entry", label: "Entry" },
  { href: "/app/ledger", label: "Ledger" },
  { href: "/app/customers", label: "People" },
  { href: "/app/settings", label: "Bank" },
];

function active(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
      {links.map((link) => {
        const on = active(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-sm ${
              on ? "bg-maroon text-white" : "text-ink/70 hover:bg-gold/10"
            }`}
            aria-current={on ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main"
    >
      <ul className="grid grid-cols-5">
        {links.map((link) => {
          const on = active(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold ${
                  on ? "text-maroon" : "text-ink/55"
                }`}
                aria-current={on ? "page" : undefined}
              >
                <span className={`h-1 w-6 rounded-full ${on ? "bg-gold" : "bg-transparent"}`} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
