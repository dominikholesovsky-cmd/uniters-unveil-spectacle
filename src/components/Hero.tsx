import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Wine, Music, Info } from "lucide-react";
import unitersLogo from "@/assets/uniters-logo.jpg";

interface HeroProps {
  language: "cs" | "en";
  onRegisterClick: () => void;
}

const Hero = ({ language, onRegisterClick }: HeroProps) => {
  const content = {
    cs: {
      title: "Večerní prohlídka",
      subtitle: "Vodojemy Žlutý Kopec",
      date: "22. ledna 2026",
      time: "18:00 - 22:00",
      location: "Vodojemy Žlutý Kopec, Brno",
      cta: "Registrovat se",
      description: "Přidejte se k nám na jedinečný večerní program plný zážitků",
      features: [
        {
          icon: Info,
          title: "Komentovaná prohlídka",
          description: "Objevte historii a tajemství vodojemů Žlutý Kopec"
        },
        {
          icon: Wine,
          title: "Catering & Ochutnávka vína",
          description: "Vychutnejte si vybrané speciality a kvalitní vína"
        },
        {
          icon: Music,
          title: "Živá hudba",
          description: "Užijte si příjemný večer s živou hudbou"
        }
      ]
    },
    en: {
      title: "Evening Tour",
      subtitle: "Žlutý Kopec Water Reservoirs",
      date: "January 22, 2026",
      time: "6:00 PM - 10:00 PM",
      location: "Žlutý Kopec Water Reservoirs, Brno",
      cta: "Register",
      description: "Join us for a unique evening program full of experiences",
      features: [
        {
          icon: Info,
          title: "Guided Tour",
          description: "Discover the history and secrets of Žlutý Kopec"
        },
        {
          icon: Wine,
          title: "Catering & Wine Tasting",
          description: "Enjoy selected specialties and quality wines"
        },
        {
          icon: Music,
          title: "Live Music",
          description: "Enjoy a pleasant evening with live music"
        }
      ]
    }
  };

  const t = content[language];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={unitersLogo} 
              alt="Uniters" 
              className="h-16 md:h-20 w-auto filter brightness-0 invert"
            />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              {t.title}
            </h1>
            <h2 className="text-3xl md:text-4xl font-light text-white/90">
              {t.subtitle}
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {t.description}
            </p>
          </div>

          {/* Event details */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-white/90 py-8">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{t.date}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{t.time}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{t.location}</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-left hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/80">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={onRegisterClick}
              className="bg-white text-primary hover:bg-white/90 px-12 py-6 text-lg font-semibold rounded-full shadow-elegant transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {t.cta}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
