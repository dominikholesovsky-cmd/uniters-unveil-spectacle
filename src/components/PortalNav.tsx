import { Heart, MessageCircle } from "lucide-react";

interface PortalNavProps {
  language: "cs" | "en";
}

export function PortalNav({ language }: PortalNavProps) {
  const content = {
    cs: {
      voting: "Charitativní hlasování",
      chat: "Networkingový chat",
    },
    en: {
      voting: "Charity Voting",
      chat: "Networking Chat",
    },
  };

  const t = content[language];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="flex justify-center gap-4 sm:gap-6 flex-wrap">
      <button
        onClick={() => scrollToSection("charity-voting")}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all hover:scale-105"
      >
        <Heart className="w-4 h-4" />
        {t.voting}
      </button>
      <button
        onClick={() => scrollToSection("networking-chat")}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all hover:scale-105"
      >
        <MessageCircle className="w-4 h-4" />
        {t.chat}
      </button>
    </nav>
  );
}

export default PortalNav;
