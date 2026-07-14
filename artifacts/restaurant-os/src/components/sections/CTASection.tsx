import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useRestaurantStore } from "@/store/restaurantStore";
import { sectionBackgroundStyle, hasSectionOverlay } from "@/utils/sectionMedia";

export function CTASection() {
  const media = useRestaurantStore((s) => s.sectionMedia.cta);

  return (
    <section className="relative py-24 bg-card border-t border-b border-border overflow-hidden" style={sectionBackgroundStyle(media)}>
      {hasSectionOverlay(media) && (
        <div className="absolute inset-0" style={{ backgroundColor: media.overlayColor, opacity: media.overlayOpacity / 100 }} />
      )}
      <div className="relative container mx-auto px-4 max-w-4xl text-center flex flex-col items-center gap-10">
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-widest uppercase text-foreground">
          Join Us for an Unforgettable Evening
        </h2>
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
          Experience culinary mastery in an atmosphere of unparalleled elegance.
        </p>

        <Button 
          asChild
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 rounded-none tracking-widest font-semibold uppercase"
          data-testid="button-cta-reservations"
        >
          <Link href="/reservations">Book Reservations</Link>
        </Button>
      </div>
    </section>
  );
}
