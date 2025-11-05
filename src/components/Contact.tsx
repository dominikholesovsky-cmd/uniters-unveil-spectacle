import { Mail, Phone } from "lucide-react";

interface ContactProps {
  language: "cs" | "en";
}

const Contact = ({ language }: ContactProps) => {
  const content = {
    cs: {
      title: "Kontakt",
      subtitle: "Máte dotazy? Neváhejte nás kontaktovat",
      name: "Frederik Bolf",
      position: "Business Development Manager"
    },
    en: {
      title: "Contact",
      subtitle: "Have questions? Feel free to contact us",
      name: "Frederik Bolf",
      position: "Business Development Manager"
    }
  };

  const t = content[language];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 sm:mb-10 md:mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-4">
              {t.title}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              {t.subtitle}
            </p>
          </div>

          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-elegant border border-border animate-fade-in max-w-xl mx-auto" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-1 sm:mb-2">
              {t.name}
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              {t.position}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center w-full">
              <a
                href="tel:+420776285777"
                className="flex items-center gap-3 text-base sm:text-lg text-foreground hover:text-primary transition-colors group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="font-medium break-all sm:break-normal">+420 776 285 777</span>
              </a>

              <a
                href="mailto:frederik.bolf@uniters.io"
                className="flex items-center gap-3 text-base sm:text-lg text-foreground hover:text-primary transition-colors group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="font-medium break-all sm:break-normal">frederik.bolf@uniters.io</span>
              </a>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
