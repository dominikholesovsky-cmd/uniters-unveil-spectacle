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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.title}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant border border-border animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-2xl font-bold text-card-foreground mb-2">
              {t.name}
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              {t.position}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="tel:+420776285777"
                className="flex items-center gap-3 text-lg text-foreground hover:text-primary transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium">+420 776 285 777</span>
              </a>

              <a
                href="mailto:frederik.bolf@uniters.io"
                className="flex items-center gap-3 text-lg text-foreground hover:text-primary transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium">frederik.bolf@uniters.io</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
