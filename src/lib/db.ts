import "server-only";
import mongoose from "mongoose";

const DEV_URI = "mongodb://localhost:27017/DayLife";

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (uri) return uri;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }
  return DEV_URI;
}

// Convierte en $eq cualquier objeto con operadores ($ne, $gt...) que llegue a un
// filtro: defensa en profundidad contra inyeccion NoSQL. Los operadores propios
// se envuelven con mongoose.trusted().
mongoose.set("sanitizeFilter", true);

type Cache = { promise: Promise<typeof mongoose> | null };

const globalForDb = globalThis as typeof globalThis & { __mongoose?: Cache };
const cache: Cache = globalForDb.__mongoose ?? { promise: null };
globalForDb.__mongoose = cache;

export async function connectDb(): Promise<typeof mongoose> {
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(getUri(), { serverSelectionTimeoutMS: 5000 })
      .catch((error: unknown) => {
        cache.promise = null;
        throw error;
      });
  }
  return cache.promise;
}
