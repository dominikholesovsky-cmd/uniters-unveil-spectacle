import { Wine, Music, Info } from "lucide-react";

interface AboutEventProps {
  language: "cs" | "en";
}

const AboutEvent = ({ language }: AboutEventProps) => {
  const content = {
    cs: {
      title: "O akci",
      description: "Přidejte se k nám na jedinečný večerní program plný zážitků",
      features: [
        {
          icon: Info,
          title: "Komentovaná prohlídka",
          description: "Objevte historii a tajemství vodojemů Žlutý Kopec s odborným průvodcem"
        },
        {
          icon: Wine,
          title: "Catering & Ochutnávka vína",
          description: "Vychutnejte si vybrané speciality a kvalitní vína v jedinečné atmosféře"
        },
        {
          icon: Music,
          title: "Živá hudba",
          description: "Užijte si příjemný večer s živou hudbou v underground prostorách"
        }
      ]
    },
    en: {
      title: "About the Event",
      description: "Join us for a unique evening program full of experiences",
      features: [
        {
          icon: Info,
          title: "Guided Tour",
          description: "Discover the history and secrets of Žlutý Kopec water reservoirs with an expert guide"
        },
        {
          icon: Wine,
          title: "Catering & Wine Tasting",
          description: "Enjoy selected specialties and quality wines in a unique atmosphere"
        },
        {
          icon: Music,
          title: "Live Music",
          description: "Enjoy a pleasant evening with live music in underground spaces"
        }
      ]
    }
  };

  const t = content[language];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in border border-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutEvent;
