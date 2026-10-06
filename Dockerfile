# syntax=docker/dockerfile:1
# Dockerfile optimizado para Next.js (App Router) con pnpm y output "standalone".
# Preparado para auto-alojamiento en VPS con Coolify.
# next.config.ts activa output "standalone" con BUILD_STANDALONE=1 (ver etapa builder)

# ---------- Base ----------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# libc6-compat mejora la compatibilidad de algunos binarios nativos en Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---------- Dependencias ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------- Build ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=1
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm build

# ---------- Runner (producción) ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Assets públicos
COPY --from=builder /app/public ./public

# Output standalone: incluye solo lo necesario para ejecutar
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Carpeta de imagenes subidas: montar aqui un volumen persistente
ENV UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads && chown nextjs:nodejs /data/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js es generado por el output standalone de Next.js
CMD ["node", "server.js"]
