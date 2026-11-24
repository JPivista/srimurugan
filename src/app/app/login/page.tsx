import { LoginForm } from "@/components/LoginForm";
import { authConfigured, safeNext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="rounded-3xl border border-gold/50 bg-white px-5 py-6 shadow-sm">
        <img src="/logo.png" alt="" className="h-16 w-16 object-contain" />
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon">
          Sree Murugan Financials
        </p>
        <h1 className="mt-2 font-display text-3xl">Office books</h1>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          Balances, customers, and the ledger are for staff only. Sign in to continue.
        </p>
        <LoginForm nextPath={safeNext(next)} configured={authConfigured()} />
      </section>
    </div>
  );
}
