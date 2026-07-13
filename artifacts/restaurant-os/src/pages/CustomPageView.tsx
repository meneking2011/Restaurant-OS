import { useRestaurantStore } from "@/store/restaurantStore";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CustomPageSection } from "@/types/restaurant";

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
  const config      = useRestaurantStore((s) => s.config);

  const fullSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const page = customPages.find((p) => p.slug === fullSlug);

  if (!page || !page.visible) {
    return (
      <Layout>
        <SectionContainer className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <h1 className="font-serif text-4xl uppercase tracking-widest text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">This page doesn't exist or is not visible.</p>
          <Button asChild variant="outline" className="rounded-none tracking-widest uppercase">
            <Link href="/">Return Home</Link>
          </Button>
        </SectionContainer>
      </Layout>
    );
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
