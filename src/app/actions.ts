"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbFailure } from "@/lib/db";
import {
  deleteEntry,
  draftFromForm,
  saveEntry,
  saveOpeningBalance,
} from "@/lib/ledger";
import type { ActionState } from "@/lib/types";

function refresh() {
  revalidatePath("/app", "layout");
}

export async function saveTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let id: number | undefined;
  try {
    const draft = draftFromForm(formData);
    id = draft.id;
    await saveEntry(draft);
    refresh();
  } catch (error) {
    if (error instanceof Error && !("code" in error)) {
      return { error: error.message };
    }
    return { error: dbFailure(error).message };
  }
  redirect(id ? "/app/ledger" : "/app");
}

export async function removeTransaction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await deleteEntry(id);
  refresh();
}

export async function saveBankBalance(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await saveOpeningBalance(String(formData.get("openingBalance") || ""));
    refresh();
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && !("code" in error)) {
      return { error: error.message };
    }
    return { error: dbFailure(error).message };
  }
}
