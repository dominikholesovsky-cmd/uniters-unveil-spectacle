import { MapPin, Navigation } from "lucide-react";
import { Button } from "./ui/button";

interface LocationMapProps {
  language: "cs" | "en";
}

const LocationMap = ({ language }: LocationMapProps) => {
  const content = {
    cs: {
      title: "Místo konání",
      address: "Vodojemy Žlutý Kopec, Brno",
      navigate: "Otevřít navigaci"
    },
    en: {
      title: "Location",
      address: "Žlutý Kopec Water Reservoirs, Brno",
      navigate: "Open Navigation"
    }
  };

  const t = content[language];

  // Coordinates for Vodojemy Žlutý Kopec
  const coordinates = "49.2108,16.5967";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.title}
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <p className="text-lg">{t.address}</p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-elegant animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {/* Map iframe */}
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=16.591%2C49.207%2C16.602%2C49.215&layer=mapnik&marker=49.2108%2C16.5967`}
                className="w-full h-full border-0"
                title={t.title}
                loading="lazy"
              />
            </div>

            {/* Navigation button overlay */}
            <div className="absolute bottom-6 right-6">
              <Button
                size="lg"
                onClick={() => window.open(mapsUrl, "_blank")}
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                <Navigation className="w-5 h-5 mr-2" />
                {t.navigate}
              </Button>
            </div>
          </div>

          {/* Attribution for OpenStreetMap */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              © OpenStreetMap contributors
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
