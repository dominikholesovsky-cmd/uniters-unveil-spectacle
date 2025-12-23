import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import ChatSection from "@/components/ChatSection";
import { CharityVoting } from "@/components/CharityVoting";
import BackToTop from "@/components/BackToTop";
import logoLight from "@/assets/full-logo_uniters_light.png";
import { supabase } from "@/lib/supabase";

const ParticipantPortal = () => {
  const [language, setLanguage] = useState<"cs" | "en">("cs");
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Session načtení (pro případ magic linku)
  useEffect(() => {
    supabase.auth.getSessionFromUrl().then(({ data: { session } }) => {
      if (session) setSession(session);
      else supabase.auth.getSession().then(({ data }) => setSession(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener?.subscription.unsubscribe();
  }, []);

  // Redirect, pokud není registrace
  useEffect(() => {
    if (!session) return; // počkej, až se načte session
    const isRegistered = localStorage.getItem("registrationSubmitted") === "true";
    if (!isRegistered) navigate("/");
  }, [navigate, session]);

  const toggleLanguage = () => setLanguage(prev => (prev === "cs" ? "en" : "cs"));

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
      </Helmet>

      <div className="min-h-screen relative overflow-hidden font-['Inter',sans-serif]" style={{ background: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
        <header className="relative z-10 p-4 sm:p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <img src={logoLight} alt="Uniters" className="h-8 sm:h-10" />
          </div>
          <LanguageToggle language={language} onToggle={toggleLanguage} />
        </header>

        <div className="container mx-auto px-4 relative z-10 pt-2 sm:pt-6 pb-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">{t.title}</h1>
            <p className="text-sm sm:text-base text-white/70">{t.subtitle}</p>
          </div>

          <div className="max-w-2xl mx-auto"><CharityVoting language={language} /></div>
          <div className="max-w-2xl mx-auto"><ChatSection language={language} /></div>
        </div>

        <BackToTop />
      </div>
    </>
  );
};

export default ParticipantPortal;
