import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, User, Lock, Mail } from "lucide-react";

interface TermsProps {
  onBack?: () => void;
}

const Terms = ({ onBack }: TermsProps) => {
  return (
    <div className="bg-background py-4 sm:py-8">
      <div className="mx-auto max-w-4xl">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět
          </Button>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="inline-flex p-2 sm:p-3 rounded-full bg-primary/20">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight px-2">
              Podmínky použití a ochrana osobních údajů
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Platné od: {new Date().toLocaleDateString('cs-CZ')}
            </p>
          </div>

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

          {/* Terms Sections */}
          <div className="space-y-3 sm:space-y-4">
            {/* Personal Data Processing */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <User className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-base sm:text-lg font-bold">1. Zpracování osobních údajů</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
                <p>
                  <strong>Správce údajů:</strong> Dominik Holešovský, osobní trenér
                </p>
                <p>
                  <strong>Rozsah zpracování:</strong> Zpracováváme pouze údaje, které nám poskytnete 
                  prostřednictvím kontaktního formuláře (jméno, e-mail, telefon, zpráva).
                </p>
                <p>
                  <strong>Účel zpracování:</strong> Vaše údaje používáme výhradně pro:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Odpověď na vaše dotazy a požadavky</li>
                  <li>Komunikaci ohledně objednávky služeb</li>
                  <li>Sjednání a realizaci tréninků</li>
                </ul>
                <p>
                  <strong>Právní základ:</strong> Zpracování probíhá na základě vašeho souhlasu 
                  (čl. 6 odst. 1 písm. a) GDPR) a oprávněného zájmu (čl. 6 odst. 1 písm. f) GDPR).
                </p>
              </div>
            </Card>

            {/* Data Storage */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-base sm:text-lg font-bold">2. Uložení a zabezpečení údajů</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
                <p>
                  Vaše osobní údaje jsou uloženy bezpečně a chráněny před neoprávněným přístupem. 
                  Používáme moderní šifrovací technologie a bezpečnostní protokoly.
                </p>
                <p>
                  <strong>Doba uložení:</strong> Vaše údaje uchováváme po dobu nezbytně nutnou 
                  pro splnění účelu zpracování, maximálně však 3 roky od poslední komunikace.
                </p>
                <p>
                  <strong>Přístup k údajům:</strong> K vašim údajům má přístup pouze Dominik Holešovský 
                  a nejsou sdíleny s žádnými třetími stranami.
                </p>
              </div>
            </Card>

            {/* Your Rights */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-base sm:text-lg font-bold">3. Vaše práva</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
                <p>V souvislosti se zpracováním vašich osobních údajů máte následující práva:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Právo na přístup:</strong> Můžete požádat o informace o zpracování vašich údajů</li>
                  <li><strong>Právo na opravu:</strong> Můžete požádat o opravu nesprávných údajů</li>
                  <li><strong>Právo na výmaz:</strong> Můžete požádat o vymazání vašich údajů</li>
                  <li><strong>Právo na omezení zpracování:</strong> Můžete požádat o omezení zpracování</li>
                  <li><strong>Právo na přenositelnost:</strong> Můžete požádat o předání údajů v běžném formátu</li>
                  <li><strong>Právo vznést námitku:</strong> Můžete vznést námitku proti zpracování</li>
                  <li><strong>Právo odvolat souhlas:</strong> Souhlas můžete kdykoli odvolat</li>
                </ul>
                <p className="pt-2">
                  Pro uplatnění svých práv nás kontaktujte na: 
                  <a href="mailto:dominik.holesovsky@gmail.com" className="text-primary hover:underline ml-1">
                    dominik.holesovsky@gmail.com
                  </a>
                </p>
              </div>
            </Card>

            {/* Service Terms */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-base sm:text-lg font-bold">4. Podmínky služeb</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
                <p><strong>Objednávka služeb:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Objednávka je závazná po vzájemné dohodě o termínu</li>
                  <li>Platba probíhá v hotovosti nebo převodem před/po tréninku</li>
                  <li>Balíčky tréninků mají stanovenou dobu platnosti</li>
                </ul>
                
                <p className="pt-3"><strong>Storno podmínky:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Zrušení tréninku minimálně 24 hodin předem je zdarma</li>
                  <li>Pozdější zrušení nebo nedostavení se počítá jako provedený trénink</li>
                  <li>V případě nemoci lze termín přesunout po dohodě</li>
                </ul>

                <p className="pt-3"><strong>Zdravotní podmínky:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Klient je povinen informovat trenéra o zdravotních omezeních</li>
                  <li>Trenér nenese odpovědnost za případné zranění při nedodržení instrukcí</li>
                  <li>Doporučujeme konzultaci s lékařem před zahájením tréninku</li>
                </ul>
              </div>
            </Card>

            {/* Cookies */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">5. Cookies</h2>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
                <p>
                  Tyto webové stránky používají pouze nezbytné cookies pro zajištění základní 
                  funkčnosti (např. uložení souhlasu s cookies). Nepoužíváme marketingové nebo 
                  sledovací cookies třetích stran.
                </p>
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-4 sm:p-6 bg-primary/10 border-primary/30">
              <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Kontakt pro dotazy k GDPR</h2>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p><strong>Dominik Holešovský</strong></p>
                <p>Email: <a href="mailto:dominik.holesovsky@gmail.com" className="text-primary hover:underline">dominik.holesovsky@gmail.com</a></p>
                <p>Telefon: <a href="tel:+420725961371" className="text-primary hover:underline">+420 725 961 371</a></p>
                <p className="pt-3 text-muted-foreground text-xs">
                  Máte-li pocit, že je vaše právo na ochranu osobních údajů porušeno, 
                  můžete podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz).
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
