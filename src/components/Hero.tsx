import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Wine, Music, Info } from "lucide-react";
import unitersLogo from "@/assets/full-logo_uniters.png";

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
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-accent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img 
              src={unitersLogo} 
              alt="Uniters" 
              className="h-10 sm:h-12 w-auto block filter-none mix-blend-normal"
              style={{ filter: 'none', mixBlendMode: 'normal' }}
            />
          </div>

          {/* Title */}
          <div className="space-y-3 sm:space-y-4 px-4">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight">
              {t.title}
            </h1>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-light text-white/90">
              {t.subtitle}
            </h2>
            <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto">
              {t.description}
            </p>
          </div>

          {/* Event details */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 text-white/90 py-6 sm:py-8 px-4">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{t.date}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{t.time}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium hidden sm:inline">{t.location}</span>
              <span className="font-medium sm:hidden">Brno</span>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-6 sm:mb-8 px-4">
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-4 sm:pt-4 px-4">
            <Button
              size="lg"
              onClick={onRegisterClick}
              className="bg-white text-primary hover:bg-white/90 px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-semibold rounded-full shadow-elegant transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full sm:w-auto"
            >
              {t.cta}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex items-start justify-center pt-24 p-2">
          <div className="w-1 h-2 sm:h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
