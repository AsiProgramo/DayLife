import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { MAX_UPLOAD_BYTES } from "./constants";

// Fuera de /public: las imagenes solo se sirven por /media/[file], con sesion.
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "uploads");

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);

// nombres generados por el servidor (y los de la version anterior de la app)
const FILENAME_PATTERN = /^[a-z0-9]{6,40}\.(png|jpe?g|gif|webp)$/;

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export class UploadError extends Error {}

/**
 * Valida la imagen por su contenido real (no por la extension), la reduce a un
 * maximo de 1600 px y la vuelve a codificar como WebP. Al recodificar se
 * eliminan los metadatos EXIF (ubicacion GPS, modelo del dispositivo).
 */
export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new UploadError("Elige una imagen");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("La imagen pesa más de 8 MB");
  }

  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer;
  try {
    const image = sharp(input, { limitInputPixels: 50_000_000 });
    const { format } = await image.metadata();
    if (!format || !ALLOWED_FORMATS.has(format)) {
      throw new UploadError("Formato no permitido");
    }
    output = await image
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UploadError("Solo se permiten imágenes PNG, JPG, GIF o WebP");
  }

  const filename = `${randomBytes(12).toString("hex")}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), output, { flag: "wx" });
  return filename;
}

export async function readImage(
  filename: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  if (!FILENAME_PATTERN.test(filename)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_DIR, filename));
    return { data, contentType: CONTENT_TYPES[path.extname(filename)] };
  } catch {
    return null;
  }
}

export async function deleteImageFile(filename: string): Promise<void> {
  if (!FILENAME_PATTERN.test(filename)) return;
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => undefined);
}
