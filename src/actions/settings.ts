"use server";

import { revalidatePath } from "next/cache";

import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { requireUser } from "@/lib/session";
import { wakeTimeSchema, type FormState } from "@/lib/validation";

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
