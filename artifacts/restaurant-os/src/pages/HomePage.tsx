import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedDishes } from "@/components/sections/FeaturedDishes";
import { CTASection } from "@/components/sections/CTASection";
import { useEffect } from "react";
import { restaurantConfig } from "@/data/mockData";

export default function HomePage() {
  useEffect(() => {
    document.title = `${restaurantConfig.name} | Fine Dining`;
  }, []);

  return (
    <Layout>
      <HeroSection />
      <FeaturedDishes />
      <CTASection />
    </Layout>
  );
}
