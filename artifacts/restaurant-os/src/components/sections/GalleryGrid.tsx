import { SectionContainer } from "@/components/ui/SectionContainer";
import { motion } from "framer-motion";
import { useRestaurantStore } from "@/store/restaurantStore";

export function GalleryGrid() {
  const { galleryImages } = useRestaurantStore();

  return (
    <SectionContainer className="bg-background">
      <div className="flex flex-col items-center mb-12">
        <span className="text-primary text-xl mb-4">✦</span>
        <h2 className="font-serif text-3xl md:text-5xl tracking-widest uppercase text-center">
          The Experience
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
        {galleryImages.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.08 }}
            className={`overflow-hidden relative ${idx === 0 || idx === 3 ? "row-span-2" : ""}`}
            style={{ aspectRatio: idx === 0 || idx === 3 ? "1 / 1.6" : "1 / 1" }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-background/10 hover:bg-transparent transition-colors duration-500" />
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
