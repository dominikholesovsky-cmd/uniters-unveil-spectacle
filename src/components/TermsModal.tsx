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
      dataController: "Uniters Projects s.r.o., IČO: 14388111, Frederik Bolf",
      dataScope: "údaje z kontaktního formuláře (jméno, e-mail, telefon, zpráva)",
      dataPurpose: "komunikace a poskytování služeb",
      dataLegalBasis: "souhlas a oprávněný zájem (GDPR)",
      rights:
        "Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost, odvolání souhlasu a vznesení námitky.",
      contact: "frederik.bolf@uniters.io | +420 776 285 777",
      serviceTermsTitle: "Podmínky služeb",
      serviceTerms:
        "Objednávka je závazná po dohodě o termínu. Platba probíhá před nebo po tréninku. Zrušení tréninku min. 24 hodin předem je zdarma.",
      close: "Zavřít",
    },
    en: {
      title: "Terms of Use & Privacy Policy",
      privacyNotice:
        "In accordance with GDPR, we process your personal data only for communication and provision of our services. Your data will never be shared with third parties.",
      dataController: "Uniters Projects s.r.o., Company ID: 14388111, Frederik Bolf",
      dataScope: "data from the contact form (name, email, phone, message)",
      dataPurpose: "communication and provision of services",
      dataLegalBasis: "consent and legitimate interest (GDPR)",
      rights:
        "You have the right to access, rectify, erase, restrict processing, data portability, withdraw consent, and object.",
      contact: "frederik.bolf@uniters.io | +420 776 285 777",
      serviceTermsTitle: "Service Terms",
      serviceTerms:
        "Order is binding upon agreement of date. Payment occurs before or after the training. Cancellation at least 24 hours in advance is free.",
      close: "Close",
    },
  };

  const t = content[language];

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-6 sm:p-8 overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 mb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">
            {t.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="absolute right-4 top-4">
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4">
          {/* GDPR Notice */}
          <Card className="p-4 sm:p-6 bg-primary/10 border-primary/30">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-foreground/80">{t.privacyNotice}</p>
            </div>
          </Card>

          {/* Data Processing */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">{language === "cs" ? "1. Zpracování osobních údajů" : "1. Data Processing"}</h2>
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-foreground/80">
              <p><strong>{language === "cs" ? "Správce údajů:" : "Data Controller:"}</strong> {t.dataController}</p>
              <p><strong>{language === "cs" ? "Rozsah zpracování:" : "Scope of processing:"}</strong> {t.dataScope}</p>
              <p><strong>{language === "cs" ? "Účel zpracování:" : "Purpose of processing:"}</strong> {t.dataPurpose}</p>
              <p><strong>{language === "cs" ? "Právní základ:" : "Legal basis:"}</strong> {t.dataLegalBasis}</p>
            </div>
          </Card>

          {/* Rights */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">{language === "cs" ? "2. Vaše práva" : "2. Your Rights"}</h2>
            </div>
            <div className="text-xs sm:text-sm text-foreground/80">
              <p>{t.rights}</p>
              <p className="pt-2">{t.contact}</p>
            </div>
          </Card>

          {/* Service Terms */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">{t.serviceTermsTitle}</h2>
            </div>
            <p className="text-xs sm:text-sm text-foreground/80">{t.serviceTerms}</p>
          </Card>

          {/* Close */}
          <div className="flex justify-center mt-4">
            <Button onClick={onClose}>{t.close}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;