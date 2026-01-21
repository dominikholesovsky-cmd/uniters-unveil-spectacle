import { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";

interface Charity {
  id: string;
  name: string;
  description: string;
}

interface CharityVotingProps {
  language: "cs" | "en";
}

// Amount per registration - will be multiplied by registration count
const AMOUNT_PER_REGISTRATION = 500;
// This will be the total number of registrations - update manually
const REGISTRATION_COUNT = 80; // <- Change this number based on actual registrations

// Hardcoded charities
const CHARITIES: Charity[] = [
  {
    id: "1",
    name: "Klub svobodných matek",
    description: "Pomozte rodinám samoživitelů a jejich dětem",
  },
  {
    id: "2",
    name: "Nadační fond Radost dětem",
    description: "Dlouhodobě pomáhají vážně nemocným dětem a dětem z dětských domovů po celém Česku",
  },
];

// Easing function for smooth animation
const easeOutQuart = (t: number): number => {
  return 1 - Math.pow(1 - t, 4);
};

export function CharityVoting({ language }: CharityVotingProps) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const charities = CHARITIES;

  const content = {
    cs: {
      sectionTitle: "Charitativní příspěvek",
      sectionSubtitle: "Vaše účast má smysl",
      intro: "Tím, že jste se zúčastnili této akce, pomáháte více, než si možná myslíte. Část z každé registrace putuje přímo na podporu vybraných charitativních projektů.",
      totalLabel: "Vaším jménem darujeme",
      currency: "Kč",
      splitInfo: "Příspěvek rozdělíme rovnoměrně mezi obě charity",
    },
    en: {
      sectionTitle: "Charity Contribution",
      sectionSubtitle: "Your participation matters",
      intro: "By attending this event, you are helping more than you might think. Part of each registration goes directly to support selected charitable projects.",
      totalLabel: "In your name, we donate",
      currency: "CZK",
      splitInfo: "The contribution will be split equally between both charities",
    },
  };

  const t = content[language];

  const totalAmount = REGISTRATION_COUNT * AMOUNT_PER_REGISTRATION;
  const amountPerCharity = Math.floor(totalAmount / charities.length);

  // Intersection Observer for triggering animation when visible
  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const duration = 3000; // 3 seconds animation
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      setDisplayAmount(Math.floor(easedProgress * totalAmount));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(language === "cs" ? "cs-CZ" : "en-US").replace(/,/g, " ");
  };

  return (
    <div ref={containerRef} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
      {/* Charity accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6cc4cc] to-[#405196]" />

      {/* Section Header */}
      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-[#6cc4cc] to-[#405196] shadow-md mb-3">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {t.sectionTitle}
        </h2>
        <p className="text-[#6cc4cc] font-semibold text-sm uppercase tracking-wide mb-3">
          {t.sectionSubtitle}
        </p>
        <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
          {t.intro}
        </p>
      </div>

      {/* Animated Amount display */}
      <div className="text-center mb-8">
        <p className="text-gray-600 uppercase tracking-wider text-xs font-medium mb-1">
          {t.totalLabel}
        </p>
        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#6cc4cc] to-[#405196] bg-clip-text text-transparent transition-all duration-100">
          {formatAmount(displayAmount)}
          <span className="text-xl ml-1">{t.currency}</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          500 × {REGISTRATION_COUNT} {language === "cs" ? "účastníků" : "participants"}
        </p>
      </div>

      {/* Charities - Centered cards */}
      <div className="space-y-3 mb-4">
        {charities.map((charity, index) => {
          const isFirst = index === 0;
          const color = isFirst ? "#6cc4cc" : "#405196";
          const bgColor = isFirst ? "bg-[#6cc4cc]/10" : "bg-[#405196]/10";

          // Animate individual charity amounts too
          const charityDisplayAmount = charities.length > 0 
            ? Math.floor((displayAmount / totalAmount) * amountPerCharity) 
            : 0;

          return (
            <div
              key={charity.id}
              className={`rounded-xl p-4 text-center transition-all ${bgColor}`}
            >
              <h3 className="font-bold text-gray-800 mb-1">{charity.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{charity.description}</p>
              <div 
                className="text-lg sm:text-xl font-bold"
                style={{ color }}
              >
                {formatAmount(charityDisplayAmount)} {t.currency}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center">{t.splitInfo}</p>
    </div>
  );
}

export default CharityVoting;