"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export function LoginForm({
  nextPath,
  configured,
}: {
  nextPath: string;
  configured: boolean;
}) {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="next" value={nextPath} />
      <label className="block text-sm font-medium" htmlFor="username">
        Username
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          disabled={!configured}
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-maroon/30 disabled:opacity-60"
        />
      </label>
      <label className="block text-sm font-medium" htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!configured}
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-maroon/30 disabled:opacity-60"
        />
      </label>
      {!configured ? (
        <p className="text-sm leading-6 text-maroon" role="alert">
          Office login is not configured. Set APP_USERNAME, APP_PASSWORD, and SESSION_SECRET before
          opening the books.
        </p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-maroon" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !configured}
        className="w-full rounded-xl bg-gold px-4 py-3.5 text-base font-semibold text-ink disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
