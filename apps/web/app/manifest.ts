import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fogora",
    short_name: "Fogora",
    description:
      "Fogora îți spune din timp când zborul tău e la risc de ceață și îți dă alternative.",
    start_url: "/",
    display: "standalone",
    background_color: "#1d1610",
    theme_color: "#1d1610",
    icons: [
      {
        src: "/cine/fogora-mark.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/cine/fogora-mark.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/cine/fogora-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/cine/fogora-mark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
