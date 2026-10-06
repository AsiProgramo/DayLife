"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { connectDb } from "@/lib/db";
import { User } from "@/lib/models";
import { clientIp, rateLimit, waitMessage } from "@/lib/rate-limit";
import { createSession, destroySession } from "@/lib/session";
import { fieldErrors, loginSchema, signupSchema, type FormState } from "@/lib/validation";

const BCRYPT_ROUNDS = 12;

// Hash de relleno: si el email no existe se compara igualmente, para que el
// tiempo de respuesta no revele que cuentas estan registradas.
const DUMMY_HASH = bcrypt.hashSync("daylife-dummy-password", BCRYPT_ROUNDS);

const text = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: text(formData, "email").slice(0, 254) };
  const parsed = loginSchema.safeParse({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const { email, password } = parsed.data;

  const [byIp, byEmail] = await Promise.all([
    rateLimit("login-ip", await clientIp(), 20, 15 * 60),
    rateLimit("login-email", email, 8, 15 * 60),
  ]);
  if (!byIp.ok || !byEmail.ok) {
    const wait = Math.max(
      byIp.ok ? 0 : byIp.retryAfterSeconds,
      byEmail.ok ? 0 : byEmail.retryAfterSeconds,
    );
    return { message: waitMessage(wait), values };
  }

  await connectDb();
  const user = await User.findOne({ email }).select("password").lean();
  const match = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !match) {
    return { message: "Email o contraseña incorrectos.", values };
  }

  await createSession(String(user._id));
  redirect("/");
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    name: text(formData, "name").slice(0, 40),
    email: text(formData, "email").slice(0, 254),
  };
  const parsed = signupSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const limit = await rateLimit("signup-ip", await clientIp(), 5, 60 * 60);
  if (!limit.ok) return { message: waitMessage(limit.retryAfterSeconds), values };

  const { name, email, password } = parsed.data;

  await connectDb();
  let userId: string;
  try {
    // Lista blanca de campos: nunca se pasa el formulario completo al modelo.
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
    userId = String(user._id);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return {
        fieldErrors: { email: "Ese email ya tiene una cuenta. Inicia sesión." },
        values,
      };
    }
    throw error;
  }

  await createSession(userId);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
