import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pebbles",
    short_name: "Pebbles",
    description: "A simple personal rhythm calendar.",
    start_url: "/pebbles",
    display: "standalone",
    background_color: "#fff7fb",
    theme_color: "#fff7fb",
    icons: [
      { src: "/pebbles/icon", sizes: "512x512", type: "image/png" },
      { src: "/pebbles/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
