import "server-only";
import mongoose from "mongoose";

import { GALLERY_PAGE_SIZE } from "./constants";
import { connectDb } from "./db";
import { Comment, Image, User } from "./models";
import { DEFAULT_BLOCKS, ICON_KEYS, type ActivityIcon, type Block, type DayLog } from "./schedule";

const isIcon = (value: string): value is ActivityIcon =>
  (ICON_KEYS as readonly string[]).includes(value);

/** Rutina del usuario (o la plantilla por defecto), su hora de dormir y lo que ya marco como hecho. */
export async function getRoutine(
  userId: string,
): Promise<{ blocks: Block[]; bedTime: string | null; dayLog: DayLog }> {
  await connectDb();
  const user = await User.findById(userId).select("routine bedTime dayLog").lean();
  const saved: { id: string; name: string; icon: string; duration: number; fixedAt?: string | null }[] =
    user?.routine ?? [];
  const blocks: Block[] =
    saved.length > 0
      ? saved.map((block) => ({
          id: block.id,
          name: block.name,
          icon: isIcon(block.icon) ? block.icon : "focus",
          duration: block.duration,
          ...(block.fixedAt ? { fixedAt: block.fixedAt } : {}),
        }))
      : DEFAULT_BLOCKS;
  return {
    blocks,
    bedTime: user?.bedTime ?? null,
    dayLog: { date: user?.dayLog?.date ?? "", done: user?.dayLog?.done ?? [] },
  };
}

export type GalleryItem = {
  id: string;
  title: string;
  filename: string;
  author: string;
  likes: number;
  views: number;
};

const displayName = (user?: { name?: string | null; email: string } | null): string =>
  user?.name?.trim() || user?.email.split("@")[0] || "Anónimo";

async function authorNames(ids: unknown[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  if (unique.length === 0) return new Map();
  const users = await User.find({ _id: mongoose.trusted({ $in: unique }) })
    .select("name email")
    .lean();
  return new Map(users.map((user) => [String(user._id), displayName(user)]));
}

export async function getGalleryPage(
  page: number,
): Promise<{ images: GalleryItem[]; hasMore: boolean }> {
  await connectDb();
  const docs = await Image.find()
    .sort({ timestamp: -1 })
    .skip((page - 1) * GALLERY_PAGE_SIZE)
    .limit(GALLERY_PAGE_SIZE + 1)
    .select("title filename user_id likes views")
    .lean();

  const hasMore = docs.length > GALLERY_PAGE_SIZE;
  const pageDocs = docs.slice(0, GALLERY_PAGE_SIZE);
  const names = await authorNames(pageDocs.map((doc) => doc.user_id));

  return {
    hasMore,
    images: pageDocs.map((doc) => ({
      id: String(doc._id),
      title: doc.title,
      filename: doc.filename,
      author: names.get(String(doc.user_id)) ?? "Anónimo",
      likes: Math.max(0, doc.likes),
      views: doc.views,
    })),
  };
}

export type ImageDetail = {
  id: string;
  title: string;
  description: string;
  filename: string;
  author: string;
  isOwner: boolean;
  liked: boolean;
  likes: number;
  views: number;
  createdAt: Date;
  comments: { id: string; name: string; comment: string; createdAt: Date }[];
};

/** Detalle de una imagen. Las visitas se cuentan aparte (accion registerView). */
export async function getImageDetail(id: string, userId: string): Promise<ImageDetail | null> {
  await connectDb();
  const image = await Image.findById(id).lean();
  if (!image) return null;

  const [names, liked, comments] = await Promise.all([
    authorNames([image.user_id]),
    Image.exists({ _id: id, likedBy: userId }),
    Comment.find({ image_id: image._id }).sort({ timestamp: 1 }).limit(200).lean(),
  ]);

  return {
    id: String(image._id),
    title: image.title,
    description: image.description ?? "",
    filename: image.filename,
    author: names.get(String(image.user_id)) ?? "Anónimo",
    isOwner: String(image.user_id) === userId,
    liked: liked !== null,
    likes: Math.max(0, image.likes),
    views: image.views,
    createdAt: image.timestamp,
    comments: comments.map((comment) => ({
      id: String(comment._id),
      name: comment.name?.trim() || "Anónimo",
      comment: comment.comment,
      createdAt: comment.timestamp,
    })),
  };
}
