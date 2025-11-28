// components/Footer.tsx
import { useState } from "react";
import TermsModal from "./TermsModal"; 
import unitersLogo from "@/assets/full-logo_uniters_light.png";

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

  const t = content[language as "cs" | "en"] ?? content.cs;

  return (
    <footer className="bg-gradient-to-b from-[#1a1a1a] via-primary/70 to-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto py-4 sm:py-5">
            <div className="relative flex items-center justify-between gap-8 sm:gap-12">
              {/* Logo - vlevo */}
              <div className="flex-shrink-0 z-10">
                <img 
                  src={unitersLogo} 
                  alt="Uniters" 
                  className="h-6 sm:h-8 md:h-10 w-auto"
                />
              </div>

              {/* Center content - perfektně na středu obrazovky */}
              <div className="absolute left-1/2 -translate-x-1/2 text-white text-center">
                <p className="text-xs text-white/90 sm:text-sm whitespace-nowrap">{t.copyright}</p>
                <p className="text-xs text-white/90 sm:text-sm whitespace-nowrap">{t.ico}</p>
              </div>

              {/* GDPR Link - vpravo */}
              <div className="flex-shrink-0 z-10">
                <button
                  type="button"
                  className="text-xs text-white sm:text-sm hover:text-white/80 transition-colors inline-block hover:underline whitespace-nowrap"
                  onClick={() => setIsTermsOpen(true)}
                >
                  {t.gdpr}
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Modal */}
      <TermsModal
        open={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        language={language}
      />
    </footer>
  );
};

export default Footer;
