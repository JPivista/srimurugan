import Link from "next/link";
import { logout } from "@/app/actions";
import { DesktopNav, MobileNav } from "./Nav";
import { RegisterApp } from "./RegisterApp";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <RegisterApp />
      <header
        className="sticky top-0 z-20 border-b-2 border-gold/70 bg-white/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4 sm:py-2">
          <Link href="/app" className="min-w-0 shrink-0">
            <img
              src="/logo.png"
              alt="Sree Murugan Financials"
              className="h-12 w-12 rounded-md object-cover object-[center_24%] sm:h-14 sm:w-14 md:h-24 md:w-auto md:rounded-none md:object-contain md:object-center"
            />
          </Link>
          <div className="flex items-center gap-2">
            <DesktopNav />
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink/70 hover:bg-gold/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-4 md:pb-12">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
