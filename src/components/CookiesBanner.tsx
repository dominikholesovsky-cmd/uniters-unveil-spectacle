import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CookiesBannerProps {
  language: "cs" | "en";
}

const CookiesBanner = ({ language }: CookiesBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  const content = {
    cs: {
      message: "Používáme soubory cookies, abychom vám zajistili co nejlepší zážitek na našich webových stránkách.",
      accept: "Přijmout",
      decline: "Odmítnout",
      learnMore: "Zjistit více"
    },
    en: {
      message: "We use cookies to ensure you get the best experience on our website.",
      accept: "Accept",
      decline: "Decline",
      learnMore: "Learn more"
    }
  };

  const t = content[language];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-foreground text-background shadow-2xl animate-slide-in-right">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs sm:text-sm md:text-base">
              {t.message}{" "}
              <a
                href="#gdpr"
                className="underline hover:text-accent transition-colors"
              >
                {t.learnMore}
              </a>
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="bg-transparent border-background text-background hover:bg-background/10 text-xs sm:text-sm"
            >
              {t.decline}
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-accent text-foreground hover:bg-accent/90 text-xs sm:text-sm"
            >
              {t.accept}
            </Button>
            <button
              onClick={handleDecline}
              className="p-1.5 sm:p-2 hover:bg-background/10 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesBanner;
