import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]
    : []),
];

/**
 * - output "standalone": lo activa el Dockerfile (BUILD_STANDALONE=1) y genera
 *   server.js. En local, `pnpm build && pnpm start` usa el servidor normal.
 * - La Content-Security-Policy (con nonce por peticion) se define en src/middleware.ts.
 */
const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,

  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  reactStrictMode: true,
  poweredByHeader: false,

  // sharp y mongoose se ejecutan solo en el servidor
  serverExternalPackages: ["sharp", "mongoose"],

  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "motion"],
    // La subida de imagenes viaja por una server action (limite de archivo: 8 MB)
    serverActions: { bodySizeLimit: "9mb" },
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
