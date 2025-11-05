import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  language: "cs" | "en";
  onToggle: () => void;
}

const LanguageToggle = ({ language, onToggle }: LanguageToggleProps) => {
  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50">
      <Button
        onClick={onToggle}
        variant="outline"
        size="lg"
        className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg px-3 sm:px-4 py-2 sm:py-3"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
        <span className="font-semibold text-sm sm:text-base">{language === "cs" ? "EN" : "CZ"}</span>
      </Button>
    </div>
  );
};

export default LanguageToggle;
