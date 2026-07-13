import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useRestaurantStore } from "@/store/restaurantStore";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const VISIT_SESSION_KEY = "ros_visit_logged";

export function Layout({ children, hideFooter = false }: LayoutProps) {
  const [location] = useLocation();
  const logVisit = useRestaurantStore((s) => s.logVisit);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Record one real site visit per browser session (not per page nav) so
  // Admin Analytics can show live, recent traffic instead of demo numbers.
  useEffect(() => {
    if (!sessionStorage.getItem(VISIT_SESSION_KEY)) {
      sessionStorage.setItem(VISIT_SESSION_KEY, "1");
      logVisit();
    }
  }, [logVisit]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <motion.main 
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-grow pt-24" // pt-24 to account for fixed navbar
      >
        {children}
      </motion.main>
      {!hideFooter && <Footer />}
    </div>
  );
}
