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

const AdminDashboard = lazy(() => import("@/admin/pages/AdminDashboard"));
const AdminMenu = lazy(() => import("@/admin/pages/AdminMenu"));
const AdminServices = lazy(() => import("@/admin/pages/AdminServices"));
const AdminTestimonials = lazy(() => import("@/admin/pages/AdminTestimonials"));
const AdminReservations = lazy(() => import("@/admin/pages/AdminReservations"));
const AdminOrders = lazy(() => import("@/admin/pages/AdminOrders"));
const AdminGallery = lazy(() => import("@/admin/pages/AdminGallery"));
const AdminAnalytics = lazy(() => import("@/admin/pages/AdminAnalytics"));
const AdminBusinessDetails = lazy(() => import("@/admin/pages/AdminBusinessDetails"));
const AdminSettings = lazy(() => import("@/admin/pages/AdminSettings"));

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
        {/* Customer website */}
        <Route path="/" component={HomePage} />
        <Route path="/menu" component={MenuPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/reservations" component={ReservationsPage} />
        <Route path="/locate-us" component={LocateUsPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/checkout" component={CheckoutPage} />

        {/* Admin — Restaurant Control Center (RCC) */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/business" component={AdminBusinessDetails} />
        <Route path="/admin/menu" component={AdminMenu} />
        <Route path="/admin/reservations" component={AdminReservations} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/gallery" component={AdminGallery} />
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/testimonials" component={AdminTestimonials} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/settings" component={AdminSettings} />

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
