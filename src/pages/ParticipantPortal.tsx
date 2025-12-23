import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import LanguageToggle from "@/components/LanguageToggle";
import logoLight from "@/assets/full-logo_uniters_light.png";

const ParticipantPortal = () => {
  const [language, setLanguage] = useState<"cs" | "en">("cs");
  const navigate = useNavigate();

  useEffect(() => {
    // Ověření, že uživatel je registrovaný
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
      comingSoon: "Další funkce budou brzy k dispozici...",
      metaTitle: "Portál pro účastníky | Uniters Event",
      metaDescription: "Portál pro registrované účastníky akce Uniters ve Vodoojemech Brno.",
    },
    en: {
      title: "Participant Portal",
      subtitle: "Welcome to the portal for registered Uniters event participants",
      comingSoon: "More features coming soon...",
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
      </Helmet>

      <div
        className="min-h-screen relative overflow-hidden"
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
        {/* Concrete texture */}
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
        {/* Water droplets */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 30%, rgba(120, 180, 220, 0.15) 0%, transparent 4%),
                            radial-gradient(circle at 75% 60%, rgba(120, 180, 220, 0.15) 0%, transparent 3%),
                            radial-gradient(circle at 50% 85%, rgba(120, 180, 220, 0.12) 0%, transparent 3.5%)`
        }} />
        {/* Atmospheric glow */}
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(100, 120, 150, 0.3) 0%, transparent 60%)'
        }} />

        {/* Header */}
        <header className="relative z-10 p-4 sm:p-6 flex justify-between items-center">
          <img src={logoLight} alt="Uniters" className="h-8 sm:h-10" />
          <LanguageToggle language={language} onToggle={toggleLanguage} />
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-8 sm:pt-16">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl p-10 shadow-xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">{t.title}</h1>
            <p className="text-lg text-gray-600 mb-8">{t.subtitle}</p>
            <p className="text-gray-500">{t.comingSoon}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantPortal;
