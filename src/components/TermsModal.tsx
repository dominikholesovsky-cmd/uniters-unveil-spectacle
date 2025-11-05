import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, User, Lock, Mail } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 relative animate-scale-in">
        {/* Close Button */}
        <Button
          variant="ghost"
          className="absolute top-4 right-4 text-muted-foreground"
          onClick={onClose}
        >
          ✕
        </Button>

        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3 mb-6">
          <div className="inline-flex p-2 sm:p-3 rounded-full bg-primary/20">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight px-2">
            Podmínky použití a ochrana osobních údajů
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Platné od: {new Date().toLocaleDateString("cs-CZ")}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
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
                <p><strong>Správce údajů:</strong> Dominik Holešovský, osobní trenér</p>
                <p><strong>Rozsah zpracování:</strong> Zpracováváme pouze údaje z kontaktního formuláře (jméno, e-mail, telefon, zpráva).</p>
                <p><strong>Účel zpracování:</strong> Vaše údaje používáme výhradně pro:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Odpověď na vaše dotazy a požadavky</li>
                  <li>Komunikaci ohledně objednávky služeb</li>
                  <li>Sjednání a realizaci tréninků</li>
                </ul>
                <p><strong>Právní základ:</strong> Souhlas (čl. 6 odst. 1 písm. a) GDPR) a oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR).</p>
              </div>
            </Card>

            {/* Data Storage */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h2 className="text-base sm:text-lg font-bold">2. Uložení a zabezpečení údajů</h2>
              </div>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/80">
                <p>Vaše osobní údaje jsou uloženy bezpečně a chráněny před neoprávněným přístupem.</p>
                <p><strong>Doba uložení:</strong> maximálně 3 roky od poslední komunikace.</p>
                <p><strong>Přístup k údajům:</strong> pouze Dominik Holešovský, nejsou sdíleny s třetími stranami.</p>
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
                  <li>Právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost, vznést námitku, odvolat souhlas</li>
                </ul>
                <p>Kontakt: <a href="mailto:dominik.holesovsky@gmail.com" className="text-primary hover:underline ml-1">dominik.holesovsky@gmail.com</a></p>
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
                  <li>Platba probíhá v hotovosti nebo převodem</li>
                  <li>Balíčky tréninků mají stanovenou dobu platnosti</li>
                </ul>
                <p><strong>Storno podmínky:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Zrušení minimálně 24 hodin předem je zdarma</li>
                  <li>Pozdější zrušení počítá jako provedený trénink</li>
                  <li>Při nemoci lze termín přesunout po dohodě</li>
                </ul>
                <p><strong>Zdravotní podmínky:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Informujte trenéra o zdravotních omezeních</li>
                  <li>Trenér nenese odpovědnost za zranění při nedodržení instrukcí</li>
                  <li>Doporučená konzultace s lékařem před tréninkem</li>
                </ul>
              </div>
            </Card>

            {/* Cookies */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">5. Cookies</h2>
              <p className="text-xs sm:text-sm text-foreground/80">
                Používáme pouze nezbytné cookies pro základní funkčnost. Nepoužíváme marketingové nebo sledovací cookies třetích stran.
              </p>
            </Card>

            {/* Contact */}
            <Card className="p-4 sm:p-6 bg-primary/10 border-primary/30">
              <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Kontakt pro dotazy k GDPR</h2>
              <p><strong>Dominik Holešovský</strong></p>
              <p>Email: <a href="mailto:dominik.holesovsky@gmail.com" className="text-primary hover:underline">dominik.holesovsky@gmail.com</a></p>
              <p>Telefon: <a href="tel:+420725961371" className="text-primary hover:underline">+420 725 961 371</a></p>
              <p className="pt-3 text-muted-foreground text-xs">
                Máte-li pocit, že je vaše právo na ochranu osobních údajů porušeno, 
                můžete podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz).
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
