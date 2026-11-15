import { createFileRoute } from "@tanstack/react-router";
import { SynergyApp } from "@/components/SynergyApp";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({ links: [{ rel: "canonical", href: "https://synergylabs.lovable.app/" }], scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", "@id": "https://synergylabs.lovable.app/#website", name: "Synergy Labs", alternateName: ["SynergyLabs", "Synergy Labs AI"], url: "https://synergylabs.lovable.app/", inLanguage: ["en", "ru", "az"] }, { "@type": "WebApplication", name: "Synergy Labs", alternateName: ["SynergyLabs", "Synergy Labs AI"], url: "https://synergylabs.lovable.app/", applicationCategory: "EducationalApplication", operatingSystem: "Web browser", description: "Mars explorer with NASA imagery, simulated rover driving and a Mars AI assistant." }] }) }], meta: [
    { title: "Synergy Labs | Mars Explorer & AI Assistant" },
    { name: "description", content: "Synergy Labs combines real NASA Mars maps, 2D and 3D exploration, simulated rover driving and an AI assistant. Available in English, Russian and Azerbaijani." },
    { property: "og:title", content: "Synergy Labs | Mars Explorer & AI Assistant" },
    { property: "og:description", content: "Explore Mars with NASA and USGS imagery, simulated rover routes and the Synergy Labs AI assistant." },
    { property: "og:site_name", content: "Synergy Labs" },
    { property: "og:url", content: "https://synergylabs.lovable.app/" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <SynergyApp />,
});
