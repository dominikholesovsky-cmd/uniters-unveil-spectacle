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
    <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-t from-background via-background-light to-background-light">
      <div className="container mx-auto px-4">
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
