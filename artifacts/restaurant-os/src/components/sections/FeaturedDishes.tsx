import { SectionContainer } from "@/components/ui/SectionContainer";
import { menuItems } from "@/data/mockData";
import { ImageComponent } from "@/components/ui/ImageComponent";
import { motion } from "framer-motion";

export function FeaturedDishes() {
  const featured = menuItems.filter(item => item.featured).slice(0, 4);

  return (
    <SectionContainer className="bg-background pt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
        {featured.map((dish, index) => (
          <motion.div 
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group flex flex-col gap-6"
            data-testid={`card-featured-dish-${dish.id}`}
          >
            <div className="overflow-hidden rounded-sm">
              <ImageComponent 
                src={dish.image} 
                alt={dish.name} 
                aspectRatio="square"
                className="group-hover:scale-105 transition-transform duration-700 w-full" 
              />
            </div>
            
            <div className="flex flex-col gap-2 text-center px-4">
              {dish.inspiredBy && (
                <span className="text-xs uppercase tracking-widest text-primary/80 font-medium">
                  {dish.inspiredBy}
                </span>
              )}
              <h3 className="font-serif text-2xl md:text-3xl font-medium tracking-wide text-primary uppercase">
                {dish.name}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
                {dish.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
