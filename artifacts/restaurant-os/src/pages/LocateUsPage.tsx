import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useRestaurantStore } from "@/store/restaurantStore";
import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocateUsPage() {
  const { config } = useRestaurantStore();
  useEffect(() => {
    document.title = "Locate Us | Reassurance";
  }, []);

  const { lat, lng } = config.address;
  const hasCoords = lat != null && lng != null;
  const fullAddress = `${config.address.street}, ${config.address.city}, ${config.address.state} ${config.address.zip}, ${config.address.country}`;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const embedUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng! - 0.01}%2C${lat! - 0.01}%2C${lng! + 0.01}%2C${lat! + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
    : null;

  return (
    <Layout>
      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-widest uppercase mb-6">
            Locate Us
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
          {/* Info Side */}
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="text-sm font-medium tracking-widest uppercase text-primary mb-4">Our Physical Location</h2>
              <p className="font-serif text-2xl md:text-3xl leading-relaxed text-foreground mb-8">
                {config.address.street}<br />
                {config.address.city}, {config.address.state} {config.address.zip}<br />
                {config.address.country}
              </p>
              
              <Button 
                asChild
                className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground tracking-widest uppercase rounded-none py-6 px-8 flex gap-3 w-full sm:w-auto"
                data-testid="button-find-on-map"
              >
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-5 h-5" />
                  {hasCoords ? "Get Directions" : "Find Us On Map"}
                </a>
              </Button>
            </div>

            <div className="border-t border-border pt-8">
              <h2 className="text-sm font-medium tracking-widest uppercase text-primary mb-6">Opening Hours</h2>
              <div className="flex flex-col gap-3">
                {config.openingHours.map((hours) => (
                  <div key={hours.day} className="flex justify-between items-center text-muted-foreground border-b border-border/30 pb-2 last:border-0">
                    <span className="font-medium">{hours.day}</span>
                    <span>{hours.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-8">
              <h2 className="text-sm font-medium tracking-widest uppercase text-primary mb-6">Quick Contact</h2>
              <div className="flex flex-col gap-4 text-muted-foreground">
                <a href={`tel:${config.phone}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                  {config.phone}
                </a>
                <a href={`mailto:${config.email}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                  {config.email}
                </a>
              </div>
            </div>
          </div>

          {/* Map Side */}
          {embedUrl ? (
            <div className="w-full h-[500px] lg:h-full min-h-[400px] bg-card border border-border rounded-sm overflow-hidden">
              <iframe
                title="Our location"
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                data-testid="iframe-location-map"
              />
            </div>
          ) : (
            <div className="w-full h-[500px] lg:h-full min-h-[400px] bg-card border border-border flex flex-col items-center justify-center relative overflow-hidden rounded-sm group">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'
              }}></div>
              <div className="relative z-10 flex flex-col items-center gap-4 text-center p-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl uppercase tracking-widest text-primary">Interactive Map</h3>
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  Click the "Find Us On Map" button to open Google Maps navigation.
                </p>
              </div>
            </div>
          )}
        </div>
      </SectionContainer>
    </Layout>
  );
}
