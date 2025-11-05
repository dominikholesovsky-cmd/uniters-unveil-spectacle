// components/TermsModal.tsx
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
      privacyHeading: "Vaše soukromí je pro nás prioritou",
      privacyText:
        "Vaše osobní údaje zadané v registračním formuláři budou zpracovávány pouze pro účely registrace na akce a komunikace s Vámi. Uniters Projects zaručuje, že údaje nebudou sdíleny s třetími stranami bez Vašeho výslovného souhlasu.",
      personalDataHeading: "1. Zpracování osobních údajů",
      personalDataText: [
        "Správce údajů: Uniters Projects, IČO: 14388111, Frederik Bolf",
        "Kontaktní osoba: Frederik Bolf",
        "Kontaktní údaje: +420 776 285 777, frederik.bolf@uniters.io",
        "Rozsah zpracování: jméno, e-mail, telefon, informace uvedené ve formuláři",
        "Účel zpracování: registrace na akce, zasílání informací o událostech, komunikace s účastníky",
        "Právní základ: Váš výslovný souhlas (GDPR, čl. 6 odst. 1 písm. a) a oprávněný zájem správce (čl. 6 odst. 1 písm. f) GDPR)",
        "Doba uchování: údaje budou uchovávány po dobu nezbytnou pro naplnění účelu registrace a komunikace, maximálně 3 roky",
      ],
      rightsHeading: "2. Vaše práva",
      rightsText: [
        "Právo na přístup k údajům",
        "Právo na opravu a výmaz osobních údajů",
        "Právo na omezení zpracování a přenositelnost údajů",
        "Právo vznést námitku proti zpracování a odvolat souhlas",
        "Pro uplatnění práv kontaktujte správce: frederik.bolf@uniters.io",
      ],
      termsHeading: "3. Podmínky služeb",
      termsText: [
        "Objednávka služeb probíhá prostřednictvím registračního formuláře. Storno a platby:",
        "Objednávka je závazná po potvrzení ze strany Uniters Projects",
        "Platba probíhá dle dohody před nebo po akci",
        "Zrušení účasti minimálně 24 hodin předem je zdarma",
      ],
      close: "Zavřít",
    },
    en: {
      title: "Terms of Use and Privacy Policy",
      privacyHeading: "Your privacy is our priority",
      privacyText:
        "Your personal data entered in the registration form will be processed solely for the purpose of event registration and communication with you. Uniters Projects ensures that the data will not be shared with third parties without your explicit consent.",
      personalDataHeading: "1. Personal Data Processing",
      personalDataText: [
        "Data Controller: Uniters Projects, Company ID: 14388111, Frederik Bolf",
        "Contact person: Frederik Bolf",
        "Contact details: +420 776 285 777, frederik.bolf@uniters.io",
        "Scope of processing: name, email, phone, information provided in the form",
        "Purpose of processing: event registration, sending information about events, communication with participants",
        "Legal basis: Your explicit consent (GDPR, Art. 6(1)(a)) and legitimate interest of the controller (Art. 6(1)(f) GDPR)",
        "Retention period: data will be retained only as long as necessary for registration and communication, max. 3 years",
      ],
      rightsHeading: "2. Your Rights",
      rightsText: [
        "Right to access data",
        "Right to rectification and erasure of personal data",
        "Right to restriction of processing and data portability",
        "Right to object to processing and withdraw consent",
        "To exercise your rights, contact the controller: frederik.bolf@uniters.io",
      ],
      termsHeading: "3. Service Terms",
      termsText: [
        "Orders are placed via the registration form. Cancellations and payments:",
        "Order is binding upon confirmation by Uniters Projects",
        "Payment is made according to agreement before or after the event",
        "Cancellation at least 24 hours in advance is free of charge",
      ],
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
          <Card className="p-4 sm:p-6 bg-primary/10 border-primary/30">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-bold text-sm sm:text-base">{t.privacyHeading}</h3>
                <p className="text-xs sm:text-sm text-foreground/80">{t.privacyText}</p>
              </div>
            </div>
          </Card>

          {/* Personal Data */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">{t.personalDataHeading}</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              {t.personalDataText.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Card>

          {/* Rights */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">{t.rightsHeading}</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <ul className="list-disc list-inside ml-4 space-y-1">
                {t.rightsText.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Service Terms */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">{t.termsHeading}</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <ul className="list-disc list-inside ml-4 space-y-1">
                {t.termsText.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
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
