import { Mail } from "lucide-react";

interface ContactProps {
  language: "cs" | "en";
}

const Contact = ({ language }: ContactProps) => {
  const content = {
    cs: {
      title: "Kontakt",
      subtitle: "Máte dotazy? Neváhejte nás kontaktovat"
    },
    en: {
      title: "Contact",
      subtitle: "Have questions? Feel free to contact us"
    }
  };

  const t = content[language];

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-muted border-t border-border w-full">
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

          <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-elegant border border-border animate-fade-in max-w-xl mx-auto" style={{ animationDelay: "0.2s" }}>
            <a
              href="mailto:hello@uniters.io"
              className="flex items-center gap-4 text-xl sm:text-2xl text-foreground hover:text-primary transition-colors group justify-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="font-semibold break-all sm:break-normal">hello@uniters.io</span>
            </a>
          </div>
          </div>
       </div> 
    </section>
  );
};

export default Contact;
