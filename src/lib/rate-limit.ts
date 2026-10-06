import "server-only";
import { headers } from "next/headers";

import { connectDb } from "./db";
import { RateLimit } from "./models";

type Result = { ok: boolean; retryAfterSeconds: number };

/**
 * Limite de peticiones por ventana fija, guardado en MongoDB para que funcione
 * igual con una o varias instancias. Los documentos caducan solos (indice TTL).
 */
export async function rateLimit(
  name: string,
  id: string,
  limit: number,
  windowSeconds: number,
): Promise<Result> {
  const windowMs = windowSeconds * 1000;
  const bucket = Math.floor(Date.now() / windowMs);
  const key = `${name}:${id}:${bucket}`;
  const expiresAt = new Date((bucket + 1) * windowMs);

  await connectDb();
  const increment = () =>
    RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: "after" },
    ).lean();

  let doc;
  try {
    doc = await increment();
  } catch {
    // dos peticiones simultaneas pueden chocar al crear el documento: reintenta
    doc = await increment();
  }

  const count = doc?.count ?? 1;
  return {
    ok: count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)),
  };
}

/**
 * IP del cliente segun el proxy. Se toma la ultima entrada de X-Forwarded-For
 * (la que agrega el proxy de confianza); las anteriores las controla el cliente.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last.slice(0, 64);
  }
  return h.get("x-real-ip")?.slice(0, 64) ?? "desconocida";
}

export function waitMessage(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1
    ? "Demasiados intentos. Espera un minuto y vuelve a intentarlo."
    : `Demasiados intentos. Vuelve a intentarlo en ${minutes} minutos.`;
}
