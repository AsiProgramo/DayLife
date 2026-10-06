import { IconArrowLeft, IconClock, IconEye, IconMessageCircle } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentForm } from "@/components/comment-form";
import { DeleteImageButton } from "@/components/delete-image-button";
import { LikeButton } from "@/components/like-button";
import { Avatar } from "@/components/ui/avatar";
import { ViewTracker } from "@/components/view-tracker";
import { formatCount, timeAgo } from "@/lib/format";
import { getImageDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { objectIdSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Imagen" };

type Props = { params: Promise<{ id: string }> };

export default async function ImagePage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  if (!objectIdSchema.safeParse(id).success) notFound();

  const image = await getImageDetail(id, user.id);
  if (!image) notFound();

  return (
    <div className="space-y-5">
      <ViewTracker imageId={image.id} />
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconArrowLeft size={18} aria-hidden />
          Volver al inicio
        </Link>
        {image.isOwner ? <DeleteImageButton imageId={image.id} title={image.title} /> : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-10">
        <div className="animate-fade-up overflow-hidden rounded-lg border border-border bg-muted shadow-soft lg:self-start">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada servida por /media (ya optimizada a WebP) */}
          <img
            src={`/media/${image.filename}`}
            alt={image.title}
            className="max-h-[78vh] w-full object-contain"
          />
        </div>

        <div className="space-y-8">
          <header className="space-y-4">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
              {image.title}
            </h1>
            <div className="flex items-center gap-3">
              <Avatar name={image.author} />
              <div className="min-w-0 leading-tight">
                <p className="truncate font-medium">{image.author}</p>
                <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconClock size={14} aria-hidden />
                    {timeAgo(image.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 tabular-nums">
                    <IconEye size={14} aria-hidden />
                    <span className="sr-only">Vistas:</span>
                    {formatCount(image.views)}
                  </span>
                </p>
              </div>
            </div>
            {image.description ? (
              <p className="max-w-prose whitespace-pre-line leading-relaxed">{image.description}</p>
            ) : null}
            <LikeButton imageId={image.id} initialLiked={image.liked} initialLikes={image.likes} />
          </header>

          <section aria-labelledby="comments-title" className="space-y-5 border-t border-border pt-6">
            <h2 id="comments-title" className="flex items-center gap-2 font-display text-xl font-semibold leading-tight">
              <IconMessageCircle size={20} aria-hidden />
              Comentarios
              {image.comments.length > 0 ? (
                <span className="text-base font-normal tabular-nums text-muted-foreground">
                  {image.comments.length}
                </span>
              ) : null}
            </h2>

            <CommentForm imageId={image.id} />

            {image.comments.length === 0 ? (
              <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                Nadie ha comentado todavía. Rompe el hielo.
              </p>
            ) : (
              <ul className="space-y-5">
                {image.comments.map((comment) => (
                  <li key={comment.id} id={comment.id} className="flex gap-3">
                    <Avatar name={comment.name} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-medium">{comment.name}</span>
                        <span className="text-sm text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                      </p>
                      <p className="whitespace-pre-line break-words leading-relaxed">{comment.comment}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
