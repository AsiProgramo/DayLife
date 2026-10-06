"use client";

import { useEffect } from "react";

import { registerView } from "@/actions/images";

/** Registra la visita al abrir la imagen, sin bloquear el render de la pagina. */
export function ViewTracker({ imageId }: { imageId: string }) {
  useEffect(() => {
    void registerView(imageId).catch(() => undefined);
  }, [imageId]);
  return null;
}
