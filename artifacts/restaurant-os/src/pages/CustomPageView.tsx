import { useEffect } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CustomPageSection } from "@/types/restaurant";
import NotFound from "@/pages/not-found";

function PageSection({ section, theme }: { section: CustomPageSection; theme: { fontHeading: string; fontBody: string } }) {
  const align =
    section.alignment === "center" ? "text-center items-center" :
    section.alignment === "right"  ? "text-right items-end" :
    "text-left items-start";

  switch (section.type) {
    case "hero":
      return (
        <div
          className={`relative flex flex-col ${align} gap-4 py-20 px-6`}
          style={{ backgroundImage: section.imageUrl ? `url(${section.imageUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {section.imageUrl && <div className="absolute inset-0 bg-black/50" />}
          <div className="relative z-10 flex flex-col gap-4 max-w-3xl mx-auto w-full" style={{ textAlign: section.alignment ?? "center" }}>
            {section.heading && (
              <h1 className="font-serif text-4xl md:text-6xl uppercase tracking-widest text-foreground leading-none" style={{ fontFamily: theme.fontHeading }}>
                {section.heading}
              </h1>
            )}
            {section.subheading && (
              <p className="text-lg tracking-widest text-muted-foreground uppercase" style={{ fontFamily: theme.fontBody }}>
                {section.subheading}
              </p>
            )}
            {section.body && (
              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto" style={{ fontFamily: theme.fontBody }}>
                {section.body}
              </p>
            )}
          </div>
        </div>
      );

    case "text":
      return (
        <div className={`flex flex-col ${align} gap-4 py-12 px-6 max-w-3xl mx-auto w-full`}>
          {section.heading && (
            <h2 className="font-serif text-2xl md:text-4xl uppercase tracking-widest text-foreground" style={{ fontFamily: theme.fontHeading }}>
              {section.heading}
            </h2>
          )}
          {section.body && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl whitespace-pre-wrap" style={{ fontFamily: theme.fontBody }}>
              {section.body}
            </p>
          )}
        </div>
      );

    case "image-text":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 px-6 max-w-5xl mx-auto w-full items-center">
          {section.imageUrl && (
            <img src={section.imageUrl} alt={section.heading ?? ""} className="w-full h-64 object-cover rounded-sm" />
          )}
          <div className={`flex flex-col ${align} gap-4`}>
            {section.heading && (
              <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-widest text-foreground" style={{ fontFamily: theme.fontHeading }}>
                {section.heading}
              </h2>
            )}
            {section.body && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap" style={{ fontFamily: theme.fontBody }}>
                {section.body}
              </p>
            )}
          </div>
        </div>
      );

    case "cta":
      return (
        <div className={`flex flex-col ${align} gap-6 py-16 px-6 max-w-3xl mx-auto w-full`}>
          {section.heading && (
            <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-widest text-foreground" style={{ fontFamily: theme.fontHeading }}>
              {section.heading}
            </h2>
          )}
          {section.body && (
            <p className="text-muted-foreground leading-relaxed max-w-xl" style={{ fontFamily: theme.fontBody }}>
              {section.body}
            </p>
          )}
          {section.ctaText && (
            <Button asChild className="rounded-none tracking-widest uppercase px-10 py-5" style={{ backgroundColor: "#c0392b", color: "#fff" }}>
              <Link href={section.ctaLink ?? "#"}>{section.ctaText}</Link>
            </Button>
          )}
        </div>
      );

    default:
      return null;
  }
}

interface CustomPageViewProps {
  slug: string;
}

export default function CustomPageView({ slug }: CustomPageViewProps) {
  const customPages = useRestaurantStore((s) => s.customPages);
  const siteTheme   = useRestaurantStore((s) => s.siteTheme);

  const fullSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const page = customPages.find((p) => p.slug === fullSlug);

  // External redirect — send visitor to external URL immediately
  useEffect(() => {
    if (page?.externalUrlEnabled && page.externalUrl) {
      window.location.href = page.externalUrl;
    }
  }, [page]);

  // Page not found or hidden → show the standard 404
  if (!page || !page.visible) {
    return <NotFound />;
  }

  // External redirect in progress — show nothing while the browser navigates away
  if (page.externalUrlEnabled && page.externalUrl) {
    return null;
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {page.sections.map((section) => (
          <PageSection
            key={section.id}
            section={section}
            theme={{ fontHeading: siteTheme.fontHeading, fontBody: siteTheme.fontBody }}
          />
        ))}
      </motion.div>
    </Layout>
  );
}
