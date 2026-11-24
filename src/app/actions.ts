"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { createSession, deleteSession, verifySession } from "@/lib/auth";
import { dbFailure } from "@/lib/db";
import {
  deleteEntry,
  draftFromForm,
  saveEntry,
  saveOpeningBalance,
} from "@/lib/ledger";
import { authConfigured, credentialsMatch, safeNext } from "@/lib/session";
import type { ActionState } from "@/lib/types";

function refresh() {
  revalidatePath("/app", "layout");
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") || "").trim().slice(0, 64);
  const password = String(formData.get("password") || "").slice(0, 128);
  const next = safeNext(String(formData.get("next") || ""));
  if (!authConfigured()) {
    return {
      error: "Office login is not configured yet. Set APP_PASSWORD and SESSION_SECRET.",
    };
  }
  if (!username || !password || !credentialsMatch(username, password)) {
    return { error: "That username or password is not correct." };
  }
  await createSession(username);
  redirect(next);
}

export async function logout() {
  await deleteSession();
  redirect("/app/login");
}

export async function saveTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();
  let id: number | undefined;
  try {
    const draft = draftFromForm(formData);
    id = draft.id;
    await saveEntry(draft);
    refresh();
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof Error && !("code" in error)) {
      return { error: error.message };
    }
    return { error: dbFailure(error).message };
  }
  redirect(id ? "/app/ledger" : "/app");
}

export async function removeTransaction(formData: FormData) {
  await verifySession();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await deleteEntry(id);
  refresh();
}

export async function saveBankBalance(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();
  try {
    await saveOpeningBalance(String(formData.get("openingBalance") || ""));
    refresh();
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof Error && !("code" in error)) {
      return { error: error.message };
    }
    return { error: dbFailure(error).message };
  }
}
