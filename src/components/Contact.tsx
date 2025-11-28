import { Mail, Phone } from "lucide-react";

interface ContactProps {
  language: "cs" | "en";
}

const Contact = ({ language }: ContactProps) => {
  const content = {
    cs: {
      title: "Kontakt",
      subtitle: "Máte dotazy? Neváhejte nás kontaktovat",
    },
    en: {
      title: "Contact",
      subtitle: "Have questions? Feel free to contact us",
    },
  };

  const t = content[language];

  return (
    <section className="py-8 sm:py-10 md:py-12 relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #1a1a1a 0%, #1a1a1a 100%)'
    }}>
      {/* Underground atmosphere layers */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          radial-gradient(circle at 70% 40%, rgba(30, 30, 30, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 25% 75%, rgba(30, 30, 30, 0.8) 0%, transparent 50%)
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
        backgroundImage: `radial-gradient(circle at 30% 55%, rgba(100, 150, 200, 0.1) 0%, transparent 3%),
                          radial-gradient(circle at 85% 25%, rgba(100, 150, 200, 0.1) 0%, transparent 2%),
                          radial-gradient(circle at 60% 85%, rgba(100, 150, 200, 0.1) 0%, transparent 2.5%)`
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
      }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl sm:rounded-2xl p-8 sm:p-10 md:p-12 shadow-elegant border border-border animate-fade-in max-w-xl mx-auto text-center">
            {/* Nadpis */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              {t.title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10">
              {t.subtitle}
            </p>

            {/* Kontakty */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center">
              {/* Telefon */}
              <a
                href="tel:+420776285777"
                className="flex items-center justify-center sm:justify-start gap-3 text-base sm:text-lg text-foreground hover:text-primary transition-colors group w-full"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="font-medium break-all sm:break-normal">
                  +420 776 285 777
                </span>
              </a>

              {/* E-mail */}
              <a
                href="mailto:hello@uniters.io"
                className="flex items-center justify-center gap-4 text-base sm:text-lg text-foreground hover:text-primary transition-colors group w-full"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="font-medium break-all sm:break-normal">
                  hello@uniters.io
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
