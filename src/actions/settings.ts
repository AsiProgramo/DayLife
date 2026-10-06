"use server";

import { revalidatePath } from "next/cache";

import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { rateLimit, waitMessage } from "@/lib/rate-limit";
import type { Block } from "@/lib/schedule";
import { requireUser } from "@/lib/session";
import {
  blockIdSchema,
  dayKeySchema,
  routineSchema,
  wakeTimeSchema,
  type FormState,
} from "@/lib/validation";

export async function setWakeTime(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = wakeTimeSchema.safeParse(formData.get("wakeTime"));
  if (!parsed.success) {
    return { fieldErrors: { wakeTime: "Elige una hora válida" } };
  }

  await connectDb();
  await User.updateOne({ _id: user.id }, { $set: { wakeTime: parsed.data } });

  revalidatePath("/");
  return { ok: true, values: { wakeTime: parsed.data } };
}

export async function saveRoutine(blocks: Block[]): Promise<{ error?: string }> {
  const user = await requireUser();

  const parsed = routineSchema.safeParse(blocks);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa la rutina" };
  }

  const limit = await rateLimit("routine", user.id, 30, 10 * 60);
  if (!limit.ok) return { error: waitMessage(limit.retryAfterSeconds) };

  await connectDb();
  await User.updateOne({ _id: user.id }, { $set: { routine: parsed.data } });

  revalidatePath("/");
  return {};
}

/** Marca o desmarca una actividad como hecha en el dia indicado por el cliente. */
export async function setActivityDone(
  blockId: string,
  day: string,
  done: boolean,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!blockIdSchema.safeParse(blockId).success || !dayKeySchema.safeParse(day).success) {
    return { error: "Actividad no válida" };
  }

  const limit = await rateLimit("done", user.id, 120, 60);
  if (!limit.ok) return { error: waitMessage(limit.retryAfterSeconds) };

  await connectDb();
  const sameDay = await User.updateOne(
    { _id: user.id, "dayLog.date": day },
    done ? { $addToSet: { "dayLog.done": blockId } } : { $pull: { "dayLog.done": blockId } },
  );
  if (sameDay.matchedCount === 0) {
    // primer cambio del dia: empieza un registro nuevo
    await User.updateOne(
      { _id: user.id },
      { $set: { dayLog: { date: day, done: done ? [blockId] : [] } } },
    );
  }

  revalidatePath("/");
  return {};
}
