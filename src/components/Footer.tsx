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
    <footer className="text-white relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)'
    }}>
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto py-4 sm:py-5">
            {/* Mobile layout - vertikální */}
            <div className="flex flex-col items-center gap-3 sm:hidden">
              <img 
                src={unitersLogo} 
                alt="Uniters" 
                className="h-6 w-auto"
              />
              <div className="text-white text-center">
                <p className="text-[10px] text-white/90">{t.copyright}</p>
                <p className="text-[10px] text-white/90">{t.ico}</p>
              </div>
              <button
                type="button"
                className="text-[10px] text-white hover:text-white/80 transition-colors hover:underline"
                onClick={() => setIsTermsOpen(true)}
              >
                {t.gdpr}
              </button>
            </div>

            {/* Desktop layout - horizontální s perfektním centrováním */}
            <div className="hidden sm:flex relative items-center justify-between gap-8 md:gap-12">
              {/* Logo - vlevo */}
              <div className="flex-shrink-0 z-10">
                <img 
                  src={unitersLogo} 
                  alt="Uniters" 
                  className="h-8 md:h-10 w-auto"
                />
              </div>

              {/* Center content - perfektně na středu obrazovky */}
              <div className="absolute left-1/2 -translate-x-1/2 text-white text-center">
                <p className="text-xs md:text-sm text-white/90 whitespace-nowrap">{t.copyright}</p>
                <p className="text-xs md:text-sm text-white/90 whitespace-nowrap">{t.ico}</p>
              </div>

              {/* GDPR Link - vpravo */}
              <div className="flex-shrink-0 z-10">
                <button
                  type="button"
                  className="text-xs md:text-sm text-white hover:text-white/80 transition-colors inline-block hover:underline whitespace-nowrap"
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
