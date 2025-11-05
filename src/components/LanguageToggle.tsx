import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  language: "cs" | "en";
  onToggle: () => void;
}

const LanguageToggle = ({ language, onToggle }: LanguageToggleProps) => {
  return (
    <div className="fixed top-6 right-6 z-50">
      <Button
        onClick={onToggle}
        variant="outline"
        size="lg"
        className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
      >
        <Globe className="w-5 h-5 mr-2" />
        <span className="font-semibold">{language === "cs" ? "EN" : "CZ"}</span>
      </Button>
    </div>
  );
};

export default LanguageToggle;
