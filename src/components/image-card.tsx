import { IconEye, IconHeart } from "@tabler/icons-react";
import Link from "next/link";

import { formatCount } from "@/lib/format";

import { Avatar } from "./ui/avatar";

export type GalleryImage = {
  id: string;
  title: string;
  filename: string;
  author: string;
  likes: number;
  views: number;
};

export function ImageCard({ image, eager }: { image: GalleryImage; eager?: boolean }) {
  return (
    <Link
      href={`/images/${image.id}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card shadow-soft transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada servida por /media (ya optimizada a WebP) */}
        <img
          src={`/media/${image.filename}`}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-2.5 p-3.5">
        <h3 className="truncate font-medium leading-tight">{image.title}</h3>
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="flex min-w-0 items-center gap-2">
            <Avatar name={image.author} size="sm" />
            <span className="truncate">{image.author}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3 tabular-nums">
            <span className="flex items-center gap-1">
              <IconHeart size={16} aria-hidden />
              <span className="sr-only">Me gusta:</span>
              {formatCount(image.likes)}
            </span>
            <span className="flex items-center gap-1">
              <IconEye size={16} aria-hidden />
              <span className="sr-only">Vistas:</span>
              {formatCount(image.views)}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
