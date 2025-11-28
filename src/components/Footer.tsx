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
          <div className="max-w-6xl mx-auto py-4 sm:py-5">
            <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
              {/* Logo - vlevo */}
              <div className="flex justify-start">
                <img 
                  src={unitersLogo} 
                  alt="Uniters" 
                  className="h-6 sm:h-8 md:h-10 w-auto"
                />
              </div>

              {/* Center content - perfektně na středu */}
              <div className="text-white text-center space-y-0.5 sm:space-y-1">
                <p className="text-xs text-white/90 sm:text-sm">{t.copyright}</p>
                <p className="text-xs text-white/90 sm:text-sm">{t.ico}</p>
              </div>

              {/* GDPR Link - vpravo */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-white sm:text-sm hover:text-white/80 transition-colors inline-block hover:underline"
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
