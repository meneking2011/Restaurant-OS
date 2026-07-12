import { Link } from "wouter";
import { useRestaurantStore } from "@/store/restaurantStore";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Leaf, GlassWater, Bell } from "lucide-react";
import { motion } from "framer-motion";

const ICON_MAP: Record<string, React.ReactNode> = {
  leaf: <Leaf className="w-6 h-6" />,
  glass: <GlassWater className="w-6 h-6" />,
  bell: <Bell className="w-6 h-6" />,
};

export function ServicesPreview() {
  const { services } = useRestaurantStore();
  return (
    <SectionContainer className="bg-card border-t border-border">
      <div className="flex flex-col items-center text-center mb-14">
        <h2 className="font-serif text-3xl md:text-5xl tracking-widest uppercase mb-4">
          Our Services
        </h2>
        <p className="text-muted-foreground text-sm md:text-base tracking-widest uppercase">
          Cuisine Assured, Hospitality Delivered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/30 mb-14">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            className="bg-card flex flex-col items-center text-center gap-4 px-8 py-10"
            data-testid={`services-preview-card-${service.id}`}
          >
            <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center text-primary shrink-0">
              {ICON_MAP[service.icon] ?? <Leaf className="w-6 h-6" />}
            </div>
            <h3 className="font-serif text-lg md:text-xl uppercase tracking-widest text-primary">
              {service.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {service.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-primary border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 px-10 py-4"
          data-testid="link-services-full"
        >
          Explore All Services
          <span className="text-base leading-none">→</span>
        </Link>
      </div>
    </SectionContainer>
  );
}
