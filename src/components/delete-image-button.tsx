"use client";

import { IconTrash } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { sileo } from "sileo";

import { deleteImage } from "@/actions/images";

import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

export function DeleteImageButton({ imageId, title }: { imageId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      // si se elimina, la accion redirige al inicio y no devuelve nada
      const result = await deleteImage(imageId);
      if (result?.error) {
        setOpen(false);
        sileo.error({ title: "No se pudo eliminar", description: result.error });
      }
    });
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} className="hover:bg-destructive/10 hover:text-destructive">
        <IconTrash size={18} aria-hidden />
        Eliminar
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="¿Eliminar esta imagen?"
        description={`Se borrará "${title}" con sus comentarios y me gusta. No se puede deshacer.`}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
            Conservar
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={pending}>
            Eliminar imagen
          </Button>
        </div>
      </Dialog>
    </>
  );
}
