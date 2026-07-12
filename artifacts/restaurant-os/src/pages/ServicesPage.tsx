import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { CTASection } from "@/components/sections/CTASection";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Leaf, GlassWater, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function ServicesPage() {
  const { services } = useRestaurantStore();
  useEffect(() => {
    document.title = "Services | Reassurance";
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "leaf": return <Leaf className="w-8 h-8 md:w-12 md:h-12 text-primary" />;
      case "glass": return <GlassWater className="w-8 h-8 md:w-12 md:h-12 text-primary" />;
      case "bell": return <Bell className="w-8 h-8 md:w-12 md:h-12 text-primary" />;
      default: return <Leaf className="w-8 h-8 md:w-12 md:h-12 text-primary" />;
    }
  };

  return (
    <Layout>
      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-widest uppercase mb-6">
            Our Culinary Services
          </h1>
          <p className="text-muted-foreground text-lg tracking-widest uppercase font-medium">
            Cuisine Assured, Hospitality Delivered.
          </p>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col gap-16 md:gap-24 mb-20">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-card p-8 md:p-12 border border-border/50 rounded-sm relative overflow-hidden"
              data-testid={`service-card-${service.id}`}
            >
              <div className="absolute top-4 right-6 text-[120px] font-serif font-bold text-foreground/5 leading-none select-none">
                {index + 1}
              </div>
              
              <div className="shrink-0 relative z-10 bg-background p-4 rounded-full border border-primary/20">
                {getIcon(service.icon)}
              </div>
              
              <div className="relative z-10 flex flex-col gap-4">
                <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-widest text-primary">
                  {service.title}
                </h2>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-serif text-2xl md:text-3xl text-foreground italic">
            "We handle the complexity, so you can focus on the experience."
          </p>
        </div>
      </SectionContainer>
      
      <CTASection />
    </Layout>
  );
}
