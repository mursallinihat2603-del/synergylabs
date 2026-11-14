import { createFileRoute } from "@tanstack/react-router";
import { SynergyApp } from "@/components/SynergyApp";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Synergy Labs | Explore Mars" },
    { name: "description", content: "Explore real NASA Mars maps, landmarks and illustrative terrain hazards with Synergy Labs." },
    { property: "og:title", content: "Synergy Labs | Explore Mars" },
    { property: "og:description", content: "A terrain-first explorer of the Red Planet with NASA and USGS imagery." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <SynergyApp />,
});
