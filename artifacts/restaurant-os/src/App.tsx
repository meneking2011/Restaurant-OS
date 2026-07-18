import { Suspense, lazy, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import NotFound from "@/pages/not-found";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Wrench } from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth";

const HomePage = lazy(() => import("@/pages/HomePage"));
const CustomPageView = lazy(() => import("@/pages/CustomPageView"));
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
const AdminBusinessDetails = lazy(() => import("@/admin/pages/AdminBusinessDetails"));
const AdminSettings = lazy(() => import("@/admin/pages/AdminSettings"));
const AdminDesignTokens = lazy(() => import("@/admin/pages/AdminDesignTokens"));
const AdminMediaLibrary = lazy(() => import("@/admin/pages/AdminMediaLibrary"));
const AdminPages = lazy(() => import("@/admin/pages/AdminPages"));
const AdminCustomPageEditor = lazy(() => import("@/admin/pages/AdminCustomPageEditor"));
const AdminNavigation = lazy(() => import("@/admin/pages/AdminNavigation"));
const AdminWebsite = lazy(() => import("@/admin/pages/AdminWebsite"));
const AdminAnalytics = lazy(() => import("@/admin/pages/AdminAnalytics"));
const AdminLogin = lazy(() => import("@/admin/pages/AdminLogin"));

const queryClient = new QueryClient();

function FallbackLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <LoadingSpinner className="w-10 h-10 text-primary" />
    </div>
  );
}

function MaintenancePage() {
  const config = useRestaurantStore((s) => s.config);
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-8">
        <Wrench className="w-8 h-8 text-primary" />
      </div>
      <h1 className="font-serif text-4xl md:text-6xl uppercase tracking-widest mb-4 text-foreground">
        {config.name}
      </h1>
      <p className="text-muted-foreground text-lg mb-2 tracking-wide uppercase">
        Under Maintenance
      </p>
      <p className="text-muted-foreground/60 text-sm max-w-md leading-relaxed">
        We are making improvements to serve you better. Please check back shortly.
      </p>
      <p className="text-xs text-muted-foreground/40 mt-10">
        Restaurant staff:{" "}
        <a href="/admin" className="text-primary hover:underline">
          Admin Panel
        </a>
      </p>
    </div>
  );
}

/** Gate for every /admin/* route except /admin/login. Redirects unauthenticated visitors to sign in. */
function RequireAuth({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [loading, user, navigate]);

  if (loading || !user) return <FallbackLoader />;
  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const quickControls = useRestaurantStore((s) => s.quickControls);

  // Show maintenance page for all non-admin routes
  const isAdmin = location.startsWith("/admin");
  if (quickControls.maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

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

        <Route path="/admin/login" component={AdminLogin} />

        <Route path="/admin" component={() => <RequireAuth component={AdminDashboard} />} />
        <Route path="/admin/website" component={() => <RequireAuth component={AdminWebsite} />} />
        <Route path="/admin/business" component={() => <RequireAuth component={AdminBusinessDetails} />} />
        <Route path="/admin/menu" component={() => <RequireAuth component={AdminMenu} />} />
        <Route path="/admin/reservations" component={() => <RequireAuth component={AdminReservations} />} />
        <Route path="/admin/orders" component={() => <RequireAuth component={AdminOrders} />} />
        <Route path="/admin/gallery" component={() => <RequireAuth component={AdminGallery} />} />
        <Route path="/admin/media" component={() => <RequireAuth component={AdminMediaLibrary} />} />
        <Route path="/admin/design-tokens" component={() => <RequireAuth component={AdminDesignTokens} />} />
        <Route path="/admin/navigation" component={() => <RequireAuth component={AdminNavigation} />} />
        <Route path="/admin/pages" component={() => <RequireAuth component={AdminPages} />} />
        <Route path="/admin/pages/:pageId" component={() => <RequireAuth component={AdminCustomPageEditor} />} />
        <Route path="/admin/services" component={() => <RequireAuth component={AdminServices} />} />
        <Route path="/admin/testimonials" component={() => <RequireAuth component={AdminTestimonials} />} />
        <Route path="/admin/analytics" component={() => <RequireAuth component={AdminAnalytics} />} />
        <Route path="/admin/settings" component={() => <RequireAuth component={AdminSettings} />} />

        {/* Dynamic catch-all: checks custom pages before showing 404 */}
        <Route path="/:slug">
          {(params) => <CustomPageView slug={params.slug ?? ""} />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
