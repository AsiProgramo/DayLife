// Constantes compartidas entre el middleware (edge) y el servidor.

const isProd = process.env.NODE_ENV === "production";

// El prefijo __Host- obliga al navegador a exigir Secure, Path=/ y sin Domain.
export const SESSION_COOKIE = isProd ? "__Host-daylife_session" : "daylife_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const GALLERY_PAGE_SIZE = 24;
