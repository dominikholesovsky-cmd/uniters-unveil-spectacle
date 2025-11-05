// components/TermsModal.tsx
import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Shield, Lock, User, Mail } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: FC<TermsModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-6 sm:p-8 overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 mb-4">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">
            Podmínky použití a ochrana osobních údajů
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
              <div className="space-y-1 sm:space-y-2">
                <h3 className="font-bold text-sm sm:text-base">Vaše soukromí je priorita</h3>
                <p className="text-xs sm:text-sm text-foreground/80">
                  V souladu s GDPR zpracováváme vaše osobní údaje pouze pro účely komunikace 
                  a poskytování našich služeb. Vaše údaje nikdy nesdílíme s třetími stranami.
                </p>
              </div>
            </div>
          </Card>

          {/* Sections */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">1. Zpracování osobních údajů</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <p><strong>Správce údajů:</strong> Dominik Holešovský</p>
              <p><strong>Rozsah zpracování:</strong> údaje z kontaktního formuláře</p>
              <p><strong>Účel zpracování:</strong> komunikace a poskytování služeb</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">2. Vaše práva</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Právo na přístup k údajům</li>
                <li>Právo na opravu a výmaz</li>
                <li>Právo na omezení zpracování a přenositelnost</li>
                <li>Právo vznést námitku a odvolat souhlas</li>
              </ul>
              <p className="pt-2">
                Kontakt: <a href="mailto:dominik.holesovsky@gmail.com" className="text-primary hover:underline">dominik.holesovsky@gmail.com</a>
              </p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">3. Podmínky služeb</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <p>Objednávka a storno podmínky služeb...</p>
            </div>
          </Card>

          {/* Close button */}
          <div className="flex justify-center mt-4">
            <Button onClick={onClose}>Zavřít</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
