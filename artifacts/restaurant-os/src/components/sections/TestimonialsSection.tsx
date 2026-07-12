import { SectionContainer } from "@/components/ui/SectionContainer";
import { testimonials } from "@/data/mockData";
import { motion } from "framer-motion";

export function TestimonialsSection() {
  return (
    <SectionContainer className="bg-card">
      <div className="flex flex-col items-center mb-16">
        <span className="text-primary text-2xl mb-4">✦</span>
        <h2 className="font-serif text-3xl md:text-5xl tracking-widest uppercase text-center">
          What Our Guests Say
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="flex flex-col items-center text-center p-8 border border-border/50 bg-background/50 rounded-sm"
          >
            <div className="flex gap-1 mb-6 text-primary">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="text-foreground/90 font-serif italic text-lg md:text-xl leading-relaxed mb-8 flex-grow">
              "{testimonial.text}"
            </p>
            <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
              — {testimonial.name}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
