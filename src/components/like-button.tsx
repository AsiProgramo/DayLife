"use client";

import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { sileo } from "sileo";

import { toggleLike } from "@/actions/images";
import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";

type Props = { imageId: string; initialLiked: boolean; initialLikes: number };

export function LikeButton({ imageId, initialLiked, initialLikes }: Props) {
  const [state, setState] = useState({ liked: initialLiked, likes: initialLikes });
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    const previous = state;
    // UI optimista: se muestra el resultado ya y se reconcilia con el servidor
    setState({ liked: !previous.liked, likes: Math.max(0, previous.likes + (previous.liked ? -1 : 1)) });
    startTransition(async () => {
      try {
        const result = await toggleLike(imageId);
        if ("error" in result) throw new Error(result.error);
        setState(result);
      } catch (error) {
        setState(previous);
        sileo.error({
          title: "No se guardó tu me gusta",
          description: error instanceof Error && error.message ? error.message : "Inténtalo de nuevo.",
        });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={state.liked}
      className={cn(
        "inline-flex h-12 items-center gap-2 rounded-md border px-5 font-medium transition duration-200 active:scale-[0.97]",
        state.liked
          ? "border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-card hover:border-primary/60 hover:bg-accent/60",
      )}
    >
      {state.liked ? <IconHeartFilled size={20} aria-hidden /> : <IconHeart size={20} aria-hidden />}
      {state.liked ? "Te gusta" : "Me gusta"}
      <span className="tabular-nums opacity-80">{formatCount(state.likes)}</span>
    </button>
  );
}
