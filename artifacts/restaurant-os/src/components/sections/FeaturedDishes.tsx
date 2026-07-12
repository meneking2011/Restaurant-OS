import { Link } from "wouter";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useRestaurantStore } from "@/store/restaurantStore";
import { motion } from "framer-motion";

export function FeaturedDishes() {
  const { menuItems } = useRestaurantStore();
  const featured = menuItems.filter(item => item.featured).slice(0, 4);

  return (
    <SectionContainer className="bg-background pt-2 pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/30">
        {featured.map((dish, index) => (
          <motion.div
            key={dish.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: index * 0.12 }}
            className="group relative flex flex-row bg-background overflow-hidden min-h-[220px] md:min-h-[260px]"
            data-testid={`card-featured-dish-${dish.id}`}
          >
            {/* Image — left half */}
            <div className="w-2/5 shrink-0 overflow-hidden relative">
              <img
                src={dish.image}
                alt={dish.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60" />
            </div>

            {/* Text — right half */}
            <div className="flex flex-col justify-center gap-2 px-6 py-8 flex-1">
              {dish.inspiredBy && (
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary/70 font-medium">
                  Inspired by {dish.inspiredBy}
                </span>
              )}
              <h3 className="font-serif text-lg md:text-xl lg:text-2xl font-medium tracking-widest text-primary uppercase leading-snug">
                {dish.name}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3">
                {dish.description}
              </p>
              <Link
                href="/menu"
                className="mt-2 text-[10px] uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors"
                data-testid={`link-view-dish-${dish.id}`}
              >
                View on Menu →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
