import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useRestaurantStore } from "@/store/restaurantStore";
import { motion } from "framer-motion";

export function HeroSection() {
  const { config } = useRestaurantStore();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${config.heroImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-8 -mt-24 md:-mt-32">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-widest uppercase text-foreground leading-none"
        >
          {config.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            asChild
            variant="destructive" 
            className="rounded-full px-12 py-6 text-lg tracking-widest font-semibold uppercase hover:scale-105 transition-transform"
            data-testid="button-hero-menu"
          >
            <Link href="/menu">MENU</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
