import { useState } from "react";
import TermsModal from "./TermsModal"; 
import unitersLogolight from "@/assets/full-logo_uniters_light.png";

interface FooterProps {
  language: "cs" | "en";
}

const Footer = ({ language }: FooterProps) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const content = {
    cs: {
      copyright: "Copyright © Uniters Projects s.r.o. 2026. Všechna práva vyhrazena.",
      ico: "IČO: 14388111",
      gdpr: "Zásady ochrany osobních údajů (GDPR)"
    },
    en: {
      copyright: "Copyright © Uniters Projects s.r.o. 2026. All rights reserved.",
      ico: "Company ID: 14388111",
      gdpr: "Privacy Policy (GDPR)"
    }
  };

  const t = content[language];

  return (
    <footer className="bg-foreground text-background py-6 sm:py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src={unitersLogolight} 
                alt="Uniters" 
                className="h-10 sm:h-12 w-auto"
              />
            </div>

            {/* Center content */}
            <div className="text-center space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm opacity-80">{t.copyright}</p>
              <p className="text-xs sm:text-sm opacity-80">{t.ico}</p>
            </div>

            {/* GDPR Link */}
            <div>
              <button
                type="button"
                className="text-xs sm:text-sm hover:text-accent transition-colors inline-block hover:underline"
                onClick={() => setIsTermsOpen(true)}
              >
                {t.gdpr}
              </button>
            </div>

            {/* Render modalu */}
            <TermsModal
              open={isTermsOpen}
              onClose={() => setIsTermsOpen(false)}
              language={language}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
