interface LanguageToggleProps {
  language: "cs" | "en";
  onToggle: () => void;
}

const LanguageToggle = ({ language, onToggle }: LanguageToggleProps) => {
  const isCzech = language === "cs";

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200"
      >
        <span className={isCzech ? "text-foreground" : ""}>CZ</span>
        <span className="text-border">|</span>
        <span className={!isCzech ? "text-foreground" : ""}>EN</span>
      </button>
    </div>
  );
};

export default LanguageToggle;
