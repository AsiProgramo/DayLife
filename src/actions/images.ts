"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { connectDb } from "@/lib/db";
import { Comment, Image } from "@/lib/models";
import { rateLimit, waitMessage } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { deleteImageFile, saveImage, UploadError } from "@/lib/uploads";
import {
  commentSchema,
  fieldErrors,
  imageSchema,
  objectIdSchema,
  type FormState,
} from "@/lib/validation";

const text = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function createImage(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const values = {
    title: text(formData, "title").slice(0, 80),
    description: text(formData, "description").slice(0, 500),
  };
  const parsed = imageSchema.safeParse({
    title: text(formData, "title"),
    description: text(formData, "description"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { fieldErrors: { image: "Elige una imagen" }, values };
  }

  const limit = await rateLimit("upload", user.id, 20, 60 * 60);
  if (!limit.ok) return { message: waitMessage(limit.retryAfterSeconds), values };

  let filename: string;
  try {
    filename = await saveImage(file);
  } catch (error) {
    if (error instanceof UploadError) {
      return { fieldErrors: { image: error.message }, values };
    }
    throw error;
  }

  let imageId: string;
  try {
    await connectDb();
    const image = await Image.create({
      title: parsed.data.title,
      description: parsed.data.description,
      filename,
      user_id: user.id,
    });
    imageId = String(image._id);
  } catch (error) {
    await deleteImageFile(filename);
    throw error;
  }

  revalidatePath("/");
  redirect(`/images/${imageId}`);
}

export type LikeResult = { liked: boolean; likes: number } | { error: string };

/** Un "me gusta" por usuario: la segunda pulsacion lo quita. */
export async function toggleLike(imageId: string): Promise<LikeResult> {
  const user = await requireUser();
  if (!objectIdSchema.safeParse(imageId).success) return { error: "Imagen no encontrada" };

  const limit = await rateLimit("like", user.id, 60, 60);
  if (!limit.ok) return { error: waitMessage(limit.retryAfterSeconds) };

  await connectDb();
  const added = await Image.findOneAndUpdate(
    { _id: imageId, likedBy: mongoose.trusted({ $ne: user.id }) },
    { $addToSet: { likedBy: user.id }, $inc: { likes: 1 } },
    { returnDocument: "after" },
  )
    .select("likes")
    .lean();
  if (added) return { liked: true, likes: added.likes };

  const removed = await Image.findOneAndUpdate(
    { _id: imageId, likedBy: user.id },
    { $pull: { likedBy: user.id }, $inc: { likes: -1 } },
    { returnDocument: "after" },
  )
    .select("likes")
    .lean();
  if (removed) return { liked: false, likes: Math.max(0, removed.likes) };

  return { error: "Imagen no encontrada" };
}

/** Cuenta una visita por usuario e imagen cada hora (no se infla al recargar). */
export async function registerView(imageId: string): Promise<void> {
  const user = await requireUser();
  if (!objectIdSchema.safeParse(imageId).success) return;

  const first = await rateLimit("view", `${user.id}:${imageId}`, 1, 60 * 60);
  if (!first.ok) return;

  await connectDb();
  await Image.updateOne({ _id: imageId }, { $inc: { views: 1 } });
}

export async function addComment(
  imageId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!objectIdSchema.safeParse(imageId).success) return { message: "Imagen no encontrada" };

  const values = { comment: text(formData, "comment").slice(0, 500) };
  const parsed = commentSchema.safeParse({ comment: text(formData, "comment") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const limit = await rateLimit("comment", user.id, 20, 10 * 60);
  if (!limit.ok) return { message: waitMessage(limit.retryAfterSeconds), values };

  await connectDb();
  if (!(await Image.exists({ _id: imageId }))) return { message: "Imagen no encontrada" };

  await Comment.create({
    image_id: imageId,
    user_id: user.id,
    name: user.name,
    comment: parsed.data.comment,
  });

  revalidatePath(`/images/${imageId}`);
  return { ok: true };
}

export async function deleteImage(imageId: string): Promise<{ error: string }> {
  const user = await requireUser();
  if (!objectIdSchema.safeParse(imageId).success) return { error: "Imagen no encontrada" };

  await connectDb();
  // El filtro por user_id es el control de acceso: solo el autor puede borrar.
  const image = await Image.findOneAndDelete({ _id: imageId, user_id: user.id }).lean();
  if (!image) return { error: "Solo el autor puede eliminar esta imagen" };

  await Promise.all([
    Comment.deleteMany({ image_id: image._id }),
    deleteImageFile(image.filename),
  ]);

  revalidatePath("/");
  redirect("/");
}
