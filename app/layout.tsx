import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Gananza — Completá. Sumá. Retirá.",
    template: "%s · Gananza",
  },
  description: "Completá juegos, encuestas y tareas online. Seguí cada recompensa y solicitá retiros desde una experiencia clara.",
  applicationName: "Gananza",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/brand/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Gananza",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Gananza — Completá. Sumá. Retirá.",
    description: "Tareas y recompensas con estados claros.",
    siteName: "Gananza",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#071019",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body className="gananza-v4">{children}</body></html>;
}
