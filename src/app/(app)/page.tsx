import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { EmptyGallery } from "@/components/empty-gallery";
import { ImageCard } from "@/components/image-card";
import { Reveal } from "@/components/reveal";
import { TodayPanel } from "@/components/today-panel";
import { buttonClass } from "@/components/ui/button";
import { getGalleryPage } from "@/lib/queries";
import { requireUser } from "@/lib/session";

type Props = { searchParams: Promise<{ pagina?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const user = await requireUser();
  const { pagina } = await searchParams;
  const page = Math.min(Math.max(Number.parseInt(pagina ?? "1", 10) || 1, 1), 500);
  const { images, hasMore } = await getGalleryPage(page);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <TodayPanel name={user.name} wakeTime={user.wakeTime} />
      </div>

      <section aria-labelledby="community-title" className="space-y-5">
        <div className="space-y-1">
          <h2 id="community-title" className="font-display text-2xl font-semibold leading-tight tracking-tight">
            Comunidad
          </h2>
          <p className="text-muted-foreground">Así viven su día otras personas.</p>
        </div>

        {images.length === 0 && page === 1 ? (
          <EmptyGallery />
        ) : (
          <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
            {images.map((image, index) => (
              <li key={image.id}>
                <Reveal index={index}>
                  <ImageCard image={image} eager={index < 3} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}

        {images.length === 0 && page > 1 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
            No hay más imágenes por aquí.
          </p>
        ) : null}

        {page > 1 || hasMore ? (
          <nav aria-label="Paginación" className="flex items-center justify-between pt-2">
            {page > 1 ? (
              <Link href={page === 2 ? "/" : `/?pagina=${page - 1}`} className={buttonClass("secondary")}>
                <IconArrowLeft size={18} aria-hidden />
                Más recientes
              </Link>
            ) : (
              <span />
            )}
            {hasMore ? (
              <Link href={`/?pagina=${page + 1}`} className={buttonClass("secondary")}>
                Anteriores
                <IconArrowRight size={18} aria-hidden />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
