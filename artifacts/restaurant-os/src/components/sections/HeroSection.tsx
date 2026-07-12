import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useRestaurantStore } from "@/store/restaurantStore";
import { motion } from "framer-motion";

export function HeroSection() {
  const { config, siteTheme } = useRestaurantStore();

  // heroImageUrl from theme overrides config.heroImage if set
  const bgImage = siteTheme.heroImageUrl || config.heroImage;
  const hasVideo = Boolean(siteTheme.heroVideoUrl);
  const overlayOpacity = (siteTheme.heroOverlayOpacity ?? 60) / 100;

  const btnRadius =
    siteTheme.buttonStyle === "pill"  ? "9999px" :
    siteTheme.buttonStyle === "sharp" ? "0px" :
    `${siteTheme.borderRadius ?? 8}px`;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Video background */}
      {hasVideo && (
        <video
          key={siteTheme.heroVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 w-full h-full object-cover"
        >
          <source src={siteTheme.heroVideoUrl} />
        </video>
      )}

      {/* Image background (shown when no video, or as fallback) */}
      {!hasVideo && bgImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})`, opacity: 1 - overlayOpacity + 0.4 }}
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `rgba(0,0,0,${overlayOpacity * 0.7})`,
        }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-8 -mt-24 md:-mt-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-widest uppercase text-foreground leading-none"
        >
          {config.name}
        </motion.h1>

        {config.tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-muted-foreground text-lg md:text-xl tracking-widest uppercase"
          >
            {config.tagline}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            asChild
            variant="destructive"
            className="px-12 py-6 text-lg tracking-widest font-semibold uppercase hover:scale-105 transition-transform"
            style={{
              backgroundColor: siteTheme.primaryHex,
              color: siteTheme.buttonTextColorHex || "#0d0b09",
              borderRadius: btnRadius,
              borderWidth: siteTheme.buttonBorderWidth ? `${siteTheme.buttonBorderWidth}px` : undefined,
              borderColor: siteTheme.primaryHex,
            }}
            data-testid="button-hero-menu"
          >
            <Link href="/menu">MENU</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
