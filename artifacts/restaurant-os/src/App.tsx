import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const HomePage = lazy(() => import("@/pages/HomePage"));
const MenuPage = lazy(() => import("@/pages/MenuPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ServicesPage = lazy(() => import("@/pages/ServicesPage"));
const ReservationsPage = lazy(() => import("@/pages/ReservationsPage"));
const LocateUsPage = lazy(() => import("@/pages/LocateUsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));

const queryClient = new QueryClient();

function FallbackLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <LoadingSpinner className="w-10 h-10 text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/menu" component={MenuPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/reservations" component={ReservationsPage} />
        <Route path="/locate-us" component={LocateUsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
