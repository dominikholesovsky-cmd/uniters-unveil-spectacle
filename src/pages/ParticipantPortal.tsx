import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { ChatSection } from "@/components/ChatSection";
import { CharityVoting } from "@/components/CharityVoting";
import logoLight from "@/assets/full-logo_uniters_light.png";

const ParticipantPortal = () => {
  const [language, setLanguage] = useState<"cs" | "en">("cs");
  const navigate = useNavigate();

  useEffect(() => {
    const isRegistered = localStorage.getItem("registrationSubmitted") === "true";
    if (!isRegistered) {
      navigate("/");
    }
  }, [navigate]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "cs" ? "en" : "cs"));
  };

  const content = {
    cs: {
      title: "Portál pro účastníky",
      subtitle: "Vítejte v portálu pro registrované účastníky akce Uniters",
      back: "Zpět na hlavní stránku",
      metaTitle: "Portál pro účastníky | Uniters Event",
      metaDescription: "Portál pro registrované účastníky akce Uniters ve Vodoojemech Brno.",
    },
    en: {
      title: "Participant Portal",
      subtitle: "Welcome to the portal for registered Uniters event participants",
      back: "Back to main page",
      metaTitle: "Participant Portal | Uniters Event",
      metaDescription: "Portal for registered participants of the Uniters event at Vodojemy Brno.",
    },
  };

  const t = content[language];

  return (
    <>
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <html lang={language} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div
        className="min-h-screen relative overflow-hidden font-['Inter',sans-serif]"
        style={{
          background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
        }}
      >
        {/* Underground atmosphere layers */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `
            radial-gradient(circle at 30% 20%, rgba(70, 70, 70, 0.6) 0%, transparent 40%),
            radial-gradient(circle at 70% 80%, rgba(70, 70, 70, 0.6) 0%, transparent 40%)
          `
        }} />
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(255, 255, 255, 0.15) 3px,
            rgba(255, 255, 255, 0.15) 6px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(255, 255, 255, 0.15) 3px,
            rgba(255, 255, 255, 0.15) 6px
          )`
        }} />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 30%, rgba(120, 180, 220, 0.15) 0%, transparent 4%),
                            radial-gradient(circle at 75% 60%, rgba(120, 180, 220, 0.15) 0%, transparent 3%),
                            radial-gradient(circle at 50% 85%, rgba(120, 180, 220, 0.12) 0%, transparent 3.5%)`
        }} />
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(100, 120, 150, 0.3) 0%, transparent 60%)'
        }} />

        {/* Header */}
        <header className="relative z-10 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
                aria-label={t.back}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img src={logoLight} alt="Uniters" className="h-8 sm:h-10" />
            </div>
            <LanguageToggle language={language} onToggle={toggleLanguage} />
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-2 sm:pt-6 pb-8 space-y-6">
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white font-['Raleway',sans-serif]">{t.title}</h1>
            <p className="text-sm sm:text-base text-white/70">{t.subtitle}</p>
          </div>

          {/* Charity Voting Section */}
          <div className="max-w-2xl mx-auto">
            <CharityVoting language={language} />
          </div>

          {/* Chat Section */}
          <div className="max-w-2xl mx-auto">
            <ChatSection language={language} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantPortal;
