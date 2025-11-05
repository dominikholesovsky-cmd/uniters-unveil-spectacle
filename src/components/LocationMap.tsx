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
      address: "Žlutý Kopec Water Tanks, Brno",
      navigate: "Open Navigation"
    }
  };

  const t = content[language];

  const coordinates = "49.1956718,16.5913221";
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`;

  return (
    <section id="location-map" className="py-8 sm:py-10 md:py-12 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Nadpis a adresa */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t.title}
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <p className="text-base sm:text-lg">
                <a
                  href="https://vodojemybrno.cz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {t.address}
                </a>
              </p>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-elegant animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=16.586%2C49.191%2C16.596%2C49.200&layer=mapnik&marker=${coordinates}`}
                className="w-full h-full border-0"
                title={t.title}
                loading="lazy"
              />
            </div>

            {/* Tlačítko navigace */}
            <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6">
              <Button
                size="lg"
                onClick={() => window.open(mapsUrl, "_blank")}
                className="bg-white text-primary hover:bg-white/90 shadow-lg text-sm sm:text-base px-4 sm:px-6"
              >
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t.navigate}
              </Button>
            </div>
          </div>

          {/* Odkaz na OpenStreetMap */}
          <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
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
