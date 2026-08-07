import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Topicora",
    short_name: "Topicora",
    description: "Useful ideas, wherever curiosity leads.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5ee",
    theme_color: "#315b54",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
