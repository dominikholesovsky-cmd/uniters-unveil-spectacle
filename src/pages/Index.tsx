import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Hero from "@/components/Hero";
import LocationMap from "@/components/LocationMap";
import RegistrationForm from "@/components/RegistrationForm";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CookiesBanner from "@/components/CookiesBanner";
import LanguageToggle from "@/components/LanguageToggle";
import PhotoGallery from "@/components/PhotoGallery";
import Schedule from "@/components/Schedule";
// ❌ Původní chybný import odstraněn

const Index = () => {
  const [language, setLanguage] = useState("cs");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "cs" ? "en" : "cs"));
  };

  const handleRegisterClick = () => {
    // Odrolování na sekci s formulářem
    const registrationSection = document.getElementById("registration-form"); 
    registrationSection?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.documentElement.lang = language;
  }, [language]);

  const seoContent = {
    cs: {
      title: "Večerní prohlídka Vodojemů Žlutý Kopec | Uniters Event 22.1.2026",
      description:
        "Přidejte se k nám na exkluzivní večerní prohlídku vodojemů Žlutý Kopec s cateringem, ochutnávkou vína a živou hudbou. Registrace na akci pořádanou firmou Uniters.",
      keywords:
        "vodojemy žlutý kopec, brno event, uniters, večerní prohlídka, ochutnávka vína, živá hudba, networking",
    },
    en: {
      title: "Evening Tour of Žlutý Kopec Water Reservoirs | Uniters Event 22.1.2026",
      description:
        "Join us for an exclusive evening tour of Žlutý Kopec water reservoirs with catering, wine tasting and live music. Registration for an event organized by Uniters.",
      keywords:
        "žlutý kopec water reservoirs, brno event, uniters, evening tour, wine tasting, live music, networking",
    },
  };

  const seo = seoContent[language];

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="author" content="Uniters" />

        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={language === "cs" ? "cs_CZ" : "en_US"} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />

        <link rel="canonical" href="https://www.uniters.one" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <main>
        <LanguageToggle language={language} onToggle={toggleLanguage} />
        <Hero language={language} onRegisterClick={handleRegisterClick} />
        
        {/* RegistrationForm nyní obsahuje logiku pro zobrazení ChatModal */}
        <RegistrationForm language={language} /> 
        
        <Schedule language={language} />
        <PhotoGallery language={language} />
        <LocationMap language={language} />
        <Contact language={language} />
        <Footer language={language} />
        <CookiesBanner language={language} />
      </main>
    </>
  );
};

export default Index;