import type { DbFailure } from "@/lib/types";

export function DbConnect({ failure }: { failure: DbFailure }) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5 shadow-sm">
      <h1 className="font-display text-2xl text-ink">Books are unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-ink/70">{failure.message}</p>
    </section>
  );
}
