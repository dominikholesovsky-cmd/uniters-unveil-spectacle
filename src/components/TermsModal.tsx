import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Shield, Lock, User, Mail } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  language: "cs" | "en";
}

const TermsModal: FC<TermsModalProps> = ({ open, onClose, language }) => {
  const content = {
    cs: {
      title: "Podmínky použití a ochrana osobních údajů",
      privacyNotice:
        "V souladu s GDPR zpracováváme vaše osobní údaje pouze pro účely komunikace a poskytování našich služeb. Vaše údaje nikdy nesdílíme s třetími stranami.",
      section1Title: "1. Zpracování osobních údajů",
      dataControllerLabel: "Správce údajů:",
      dataController: "Uniters Projects s.r.o., IČO: 14388111, Frederik Bolf",
      dataScopeLabel: "Rozsah zpracování:",
      dataScope: "Údaje z kontaktního formuláře (jméno, e-mail, telefon, zpráva)",
      dataPurposeLabel: "Účel zpracování:",
      dataPurpose: "Komunikace a poskytování služeb",
      dataLegalBasisLabel: "Právní základ:",
      dataLegalBasis: "Souhlas a oprávněný zájem (GDPR)",
      section2Title: "2. Vaše práva",
      rights:
        "Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost, odvolání souhlasu a vznesení námitky.",
      contact: "hello@uniters.io",
      serviceTermsTitle: "Podmínky služeb",
      serviceTerms:
        "Objednávka je závazná po dohodě o termínu. Platba probíhá před nebo po tréninku. Zrušení tréninku min. 24 hodin předem je zdarma.",
      close: "Zavřít",
    },
    en: {
      title: "Terms of Use & Privacy Policy",
      privacyNotice:
        "In accordance with GDPR, we process your personal data only for communication and provision of our services. Your data will never be shared with third parties.",
      section1Title: "1. Data Processing",
      dataControllerLabel: "Data Controller:",
      dataController: "Uniters Projects s.r.o., Company ID: 14388111, Frederik Bolf",
      dataScopeLabel: "Scope of processing:",
      dataScope: "Data from the contact form (name, email, phone, message)",
      dataPurposeLabel: "Purpose of processing:",
      dataPurpose: "Communication and provision of services",
      dataLegalBasisLabel: "Legal basis:",
      dataLegalBasis: "consent and legitimate interest (GDPR)",
      section2Title: "2. Your Rights",
      rights:
        "You have the right to access, rectify, erase, restrict processing, data portability, withdraw consent, and object.",
      contact: "hello@uniters.io",
      serviceTermsTitle: "Service Terms",
      serviceTerms:
        "Order is binding upon agreement of date. Payment occurs before or after the training. Cancellation at least 24 hours in advance is free.",
      close: "Close",
    },
  };

  const t = content[language] ?? content.cs;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-6 sm:p-8 overflow-y-auto bg-gray-900 text-white">
        <DialogHeader className="sticky top-0 bg-gray-900 z-10 mb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
            {t.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4 text-white">
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          {/* GDPR Notice */}
          <Card className="p-4 sm:p-6 bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/80 leading-relaxed">{t.privacyNotice}</p>
            </div>
          </Card>

          {/* Data Processing */}
          <Card className="p-4 sm:p-6 bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-start gap-3 mb-3">
              <User className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold text-white">{t.section1Title}</h2>
            </div>
            <div className="space-y-2 text-sm text-white/80 leading-relaxed">
              <p>
                <strong>{t.dataControllerLabel}</strong> {t.dataController}
              </p>
              <p>
                <strong>{t.dataScopeLabel}</strong> {t.dataScope}
              </p>
              <p>
                <strong>{t.dataPurposeLabel}</strong> {t.dataPurpose}
              </p>
              <p>
                <strong>{t.dataLegalBasisLabel}</strong> {t.dataLegalBasis}
              </p>
            </div>
          </Card>

          {/* Rights */}
          <Card className="p-4 sm:p-6 bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold text-white">{t.section2Title}</h2>
            </div>
            <div className="space-y-2 text-sm text-white/80 leading-relaxed">
              <p>{t.rights}</p>
              <p className="pt-1">{t.contact}</p>
            </div>
          </Card>

          {/* Service Terms */}
          <Card className="p-4 sm:p-6 bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold text-white">{t.serviceTermsTitle}</h2>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{t.serviceTerms}</p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
