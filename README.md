# DayLife

DayLife genera tu horario del día a partir de tu hora de despertar y te deja compartir tu estilo de vida con imágenes: subirlas, verlas, darles me gusta y comentarlas.

## Funciones

- Registro e inicio de sesión con email y contraseña.
- Horario del día calculado desde tu hora de despertar, con la actividad actual, su progreso y lo que sigue.
- Cosas fijas y tiempo libre: marca lo que tiene hora (trabajo, clases, citas) y DayLife te dice cuánto tiempo libre te queda hasta tu hora de dormir. Tú decides cuánto le das a cada actividad y se acomodan solas en los huecos; lo que no repartes aparece como tiempo libre. Avisa si dos cosas fijas se cruzan o si te pasas del tiempo disponible.
- Rutina personalizable: añade, quita, renombra y reordena actividades, cambia su duración e icono, o parte de una plantilla.
- Marca cada actividad como hecha y sigue el avance del día. El día empieza al despertar, no a medianoche.
- Galería de la comunidad: subir, ver, me gusta (uno por persona), comentarios y borrado (solo el autor).
- Tema claro y oscuro según la preferencia del sistema.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript estricto
- Tailwind CSS con tokens semánticos (`src/app/globals.css`)
- MongoDB con Mongoose
- Tabler Icons, Motion y Sileo (toasts)
- pnpm

## Requisitos

- Node.js 20 o superior
- pnpm 9
- MongoDB (local, Docker o MongoDB Atlas)

## Cómo ejecutarlo

```bash
pnpm install
cp .env.example .env        # ajusta MONGODB_URI si no usas MongoDB local
pnpm dev                    # http://localhost:3000
```

Crea una cuenta en `/crear` y elige tu hora de despertar.

Otros comandos:

```bash
pnpm build && pnpm start    # producción (requiere MONGODB_URI)
pnpm lint
pnpm typecheck
```

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/DayLife` (solo en desarrollo) | Conexión a MongoDB. Obligatoria en producción: sin ella la app no arranca. |
| `UPLOAD_DIR` | `./uploads` | Carpeta de las imágenes subidas. En producción debe ser un volumen persistente. |

## Despliegue

El `Dockerfile` genera una imagen con el output `standalone` de Next.js y un usuario sin privilegios. Sirve para Railway, Coolify o cualquier VPS.

- La imagen guarda las subidas en `/data/uploads` (`UPLOAD_DIR`): monta ahí un volumen persistente en el que pueda escribir el usuario `nextjs` (uid 1001).
- La app debe quedar detrás de un único proxy con HTTPS: la cookie de sesión es `Secure` y el límite de intentos usa la IP que informa ese proxy.
- `GET /api/health` responde `{"status":"ok"}` para el healthcheck.

## Seguridad

- **Sesiones:** token aleatorio en cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción; en la base de datos solo se guarda su hash. Cerrar sesión la invalida en el servidor.
- **Contraseñas:** bcrypt (coste 12), mínimo 8 caracteres. El login responde igual si el email no existe.
- **Límite de intentos** en login, registro, subidas, comentarios y me gusta (guardado en MongoDB).
- **Subidas:** se valida el contenido real del archivo, se recodifica a WebP (elimina metadatos EXIF como la ubicación) y se guarda fuera de `/public`. Las imágenes solo se sirven con sesión, por `/media/[file]`.
- **Cabeceras:** Content-Security-Policy con nonce por petición (`src/middleware.ts`), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción.
- **Entradas:** todo se valida con zod y Mongoose usa `sanitizeFilter` contra inyección NoSQL. Las mutaciones son server actions, que rechazan peticiones de otros orígenes.

## Estructura

```
src/
  app/            rutas (App Router): (auth) login y registro, (app) inicio e imagen, media, api/health
  actions/        server actions: auth, images, settings
  components/     componentes de interfaz (ui/ = primitivas)
  lib/            base de datos, modelos, sesión, validación, subidas, horario
  middleware.ts   CSP y filtro de acceso
```
