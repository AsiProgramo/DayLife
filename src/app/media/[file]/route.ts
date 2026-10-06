import { readImage } from "@/lib/uploads";
import { getSessionUser } from "@/lib/session";

type Context = { params: Promise<{ file: string }> };

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  const user = await getSessionUser();
  if (!user) return new Response("No autorizado", { status: 401 });

  const { file } = await params;
  const image = await readImage(file);
  if (!image) return new Response("No encontrada", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.data.length),
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      // un archivo subido nunca debe poder ejecutar nada aunque se abra directo
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
