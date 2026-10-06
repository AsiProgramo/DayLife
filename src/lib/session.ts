import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./constants";
import { connectDb } from "./db";
import { Session, User } from "./models";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  wakeTime: string | null;
};

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  await connectDb();
  await Session.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectDb();
    await Session.deleteOne({ tokenHash: hashToken(token) });
  }
  store.delete(SESSION_COOKIE);
}

/** Usuario de la sesion actual, o null. Se resuelve una sola vez por peticion. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  await connectDb();
  const session = await Session.findOne({ tokenHash: hashToken(token) }).lean();
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;

  const user = await User.findById(session.userId).select("email name wakeTime").lean();
  if (!user) return null;

  return {
    id: String(user._id),
    email: user.email,
    name: user.name?.trim() || user.email.split("@")[0],
    wakeTime: user.wakeTime ?? null,
  };
});

/** Para paginas y acciones privadas: redirige al login si no hay sesion valida. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
