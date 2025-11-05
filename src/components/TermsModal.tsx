import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, User, Lock, Mail, X } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const TermsModal = ({ open, onClose }: TermsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto max-h-[90vh] relative">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold">
            Podmínky použití a ochrana osobních údajů
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" className="p-2">
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
                  V souladu s GDPR zpracováváme vaše osobní údaje pouze pro účely komunikace a poskytování našich služeb. Vaše údaje nikdy nesdílíme s třetími stranami.
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
              <p><strong>Správce údajů:</strong> Dominik Holešovský, osobní trenér</p>
              <p><strong>Rozsah zpracování:</strong> Zpracováváme pouze údaje, které nám poskytnete prostřednictvím kontaktního formuláře (jméno, e-mail, telefon, zpráva).</p>
              <p><strong>Účel zpracování:</strong> Vaše údaje používáme výhradně pro:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Odpověď na vaše dotazy a požadavky</li>
                <li>Komunikaci ohledně objednávky služeb</li>
                <li>Sjednání a realizaci tréninků</li>
              </ul>
              <p><strong>Právní základ:</strong> Zpracování probíhá na základě vašeho souhlasu (čl. 6 odst. 1 písm. a) GDPR) a oprávněného zájmu (čl. 6 odst. 1 písm. f) GDPR).</p>
            </div>
          </Card>

          {/* Data Storage */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">2. Uložení a zabezpečení údajů</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <p>Vaše osobní údaje jsou uloženy bezpečně a chráněny před neoprávněným přístupem. Používáme moderní šifrovací technologie a bezpečnostní protokoly.</p>
              <p><strong>Doba uložení:</strong> Maximálně 3 roky od poslední komunikace.</p>
              <p><strong>Přístup k údajům:</strong> Pouze Dominik Holešovský, žádné třetí strany.</p>
            </div>
          </Card>

          {/* Rights */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">3. Vaše práva</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Právo na přístup k údajům</li>
                <li>Právo na opravu nesprávných údajů</li>
                <li>Právo na výmaz údajů</li>
                <li>Právo na omezení zpracování</li>
                <li>Právo na přenositelnost údajů</li>
                <li>Právo vznést námitku</li>
                <li>Právo odvolat souhlas</li>
              </ul>
              <p className="pt-2">Kontakt: <a href="mailto:dominik.holesovsky@gmail.com" className="text-primary hover:underline">dominik.holesovsky@gmail.com</a></p>
            </div>
          </Card>

          {/* Service Terms */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <h2 className="text-base sm:text-lg font-bold">4. Podmínky služeb</h2>
            </div>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
              <p>Objednávka služeb a storno podmínky...</p>
            </div>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end mt-4">
            <Button onClick={onClose}>Zavřít</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
