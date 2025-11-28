import { MapPin, Navigation } from "lucide-react";
import { Button } from "./ui/button";

interface LocationMapProps {
  language: "cs" | "en";
}

const LocationMap = ({ language }: LocationMapProps) => {
  const content = {
    cs: {
      title: "Lokalita eventu",
      address: "Vodojemy Žlutý Kopec, Brno",
      navigate: "Otevřít navigaci"
    },
    en: {
      title: "Event Location",
      address: "Žlutý Kopec Water Tanks, Brno",
      navigate: "Open Navigation"
    }
  };

  const t = content[language];
  const coordinates = "49.1956718,16.5913221";
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`;

  return (
    <section
      id="location-map"
      className="py-8 sm:py-10 md:py-12 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #1a1a1a 100%)'
      }}
    >
      {/* Underground atmosphere layers */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          radial-gradient(circle at 40% 50%, rgba(30, 30, 30, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 80% 30%, rgba(30, 30, 30, 0.8) 0%, transparent 50%)
        `
      }} />
      {/* Concrete texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.1) 2px,
          rgba(255, 255, 255, 0.1) 4px
        ),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.1) 2px,
          rgba(255, 255, 255, 0.1) 4px
        )`
      }} />
      {/* Water droplets */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 55% 35%, rgba(100, 150, 200, 0.1) 0%, transparent 3%),
                          radial-gradient(circle at 25% 65%, rgba(100, 150, 200, 0.1) 0%, transparent 2%),
                          radial-gradient(circle at 75% 80%, rgba(100, 150, 200, 0.1) 0%, transparent 2.5%)`
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
      }} />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 animate-fade-in">
            {t.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-white mb-8 sm:mb-10">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-white text-base sm:text-lg">{t.address}</p>
          </div>

          <div
            className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-elegant animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="aspect-video w-full transform scale-85">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=16.586%2C49.191%2C16.596%2C49.200&layer=mapnik&marker=${coordinates}`}
                className="w-full h-full border-0"
                title={t.title}
                loading="lazy"
              />
            </div>

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

          <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-white/70">
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