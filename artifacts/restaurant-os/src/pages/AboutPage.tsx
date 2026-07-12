import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { ImageComponent } from "@/components/ui/ImageComponent";
import { motion } from "framer-motion";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | Reassurance";
  }, []);

  return (
    <Layout>
      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <span className="text-primary text-2xl mb-4">✦</span>
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-widest uppercase mb-6">
            Our Story
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Founded on the belief that a meal should be a transformative experience, Reassurance offers a sanctuary from the frantic pace of modern life. We strip away the unnecessary, leaving only the essential: extraordinary food, impeccable service, and a timeless atmosphere.
          </p>
        </div>

        {/* Chef Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ImageComponent 
              src="https://picsum.photos/seed/chef/600/800" 
              alt="Executive Chef" 
              aspectRatio="portrait"
              className="rounded-sm" 
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <span className="text-sm font-medium tracking-widest uppercase text-primary">Executive Chef</span>
            <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-widest">
              Julian Vance
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              With over two decades spent in the kitchens of Paris and Tokyo, Chef Vance brings a meticulous, uncompromising approach to his craft. Every menu at Reassurance is a reflection of his dedication to seasonal integrity and bold, elemental flavors.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              "We are not here to reinvent food. We are here to perfect its delivery."
            </p>
          </motion.div>
        </div>

        {/* Values/Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          {[
            {
              title: "Sourcing",
              text: "We partner exclusively with sustainable farms and fisheries. If an ingredient does not meet our standard of excellence, it does not enter our kitchen."
            },
            {
              title: "Craft",
              text: "There are no shortcuts here. From our 48-hour broths to our hand-kneaded pastas, everything is crafted in-house with relentless precision."
            },
            {
              title: "Atmosphere",
              text: "A truly great meal requires the right environment. We have designed our space to provide acoustic calm, perfect lighting, and unhurried comfort."
            }
          ].map((pillar, i) => (
            <motion.div 
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="text-center p-8 bg-card rounded-sm border border-border"
            >
              <h3 className="font-serif text-2xl text-primary uppercase tracking-widest mb-4">{pillar.title}</h3>
              <p className="text-muted-foreground">{pillar.text}</p>
            </motion.div>
          ))}
        </div>
      </SectionContainer>
      
      <GalleryGrid />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
