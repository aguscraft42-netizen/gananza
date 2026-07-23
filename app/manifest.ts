import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gananza",
    short_name: "Gananza",
    description: "Completá tareas y sumá recompensas verificadas.",
    start_url: "/",
    display: "standalone",
    background_color: "#06111f",
    theme_color: "#071019",
    lang: "es-AR",
    categories: ["finance", "lifestyle", "productivity"],
    icons: [
      { src: "/brand/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
