import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { Toaster } from "sileo";

import { Providers } from "@/components/providers";

import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Outfit({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "DayLife", template: "%s · DayLife" },
  description:
    "Organiza tu día a partir de tu hora de despertar y comparte tu estilo de vida con imágenes.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#091b20" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Leer las cabeceras hace que cada pagina se genere por peticion: asi Next
  // aplica a sus scripts el nonce de la Content-Security-Policy (middleware).
  await headers();

  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
        <Toaster position="top-center" theme="system" offset={{ top: 16 }} />
      </body>
    </html>
  );
}
