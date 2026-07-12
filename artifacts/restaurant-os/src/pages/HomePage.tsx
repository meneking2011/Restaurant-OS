import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedDishes } from "@/components/sections/FeaturedDishes";
import { ServicesPreview } from "@/components/sections/ServicesPreview";
import { CTASection } from "@/components/sections/CTASection";
import { useEffect } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";

export default function HomePage() {
  const { config } = useRestaurantStore();
  useEffect(() => {
    document.title = `${config.name} | Fine Dining`;
  }, []);

  return (
    <Layout>
      <HeroSection />
      <FeaturedDishes />
      <ServicesPreview />
      <CTASection />
    </Layout>
  );
}
