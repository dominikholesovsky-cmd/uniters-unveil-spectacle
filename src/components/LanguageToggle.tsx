interface LanguageToggleProps {
  language: "cs" | "en";
  onToggle: () => void;
}

const LanguageToggle = ({ language, onToggle }: LanguageToggleProps) => {
  const isCzech = language === "cs";

  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50">
      <button
        onClick={onToggle}
        className={`
          relative flex items-center w-24 h-10 sm:w-28 sm:h-12 rounded-full
          border border-border bg-white shadow-lg transition-all duration-300
          hover:shadow-xl overflow-hidden
        `}
      >
        {/* Posuvník */}
        <div
          className={`
            absolute top-0 left-0 w-1/2 h-full bg-primary rounded-full
            transition-all duration-300
            ${isCzech ? "translate-x-0" : "translate-x-full"}
          `}
        />

        {/* Texty */}
        <div className="relative z-10 flex w-full justify-between px-4 text-sm sm:text-base font-semibold">
          <span
            className={`transition-colors ${
              isCzech ? "text-white" : "text-muted-foreground"
            }`}
          >
            CZ
          </span>
          <span
            className={`transition-colors ${
              !isCzech ? "text-white" : "text-muted-foreground"
            }`}
          >
            EN
          </span>
        </div>
      </button>
    </div>
  );
};

export default LanguageToggle;
