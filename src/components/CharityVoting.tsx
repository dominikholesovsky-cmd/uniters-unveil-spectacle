import { useState, useEffect } from "react";
import { Heart, Users, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Charity {
  id: string;
  name: string;
  description: string;
  votes: number;
}

interface CharityVotingProps {
  language: "cs" | "en";
}

const AMOUNT_PER_DONOR = 500;
const LOCAL_STORAGE_KEY = "uniters_charity_donated";

// Coin component for falling animation
const FallingCoin = ({ delay, left }: { delay: number; left: number }) => (
  <div
    className="absolute text-2xl animate-coin-fall pointer-events-none"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      top: "-30px",
    }}
  >
    🪙
  </div>
);

export function CharityVoting({ language }: CharityVotingProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [hasDonated, setHasDonated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [justDonated, setJustDonated] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [coinTrigger, setCoinTrigger] = useState(0);

  const content = {
    cs: {
      sectionTitle: "Charitativní příspěvek",
      sectionSubtitle: "Vaše účast má smysl",
      intro: "Tím, že jste se zúčastnili této akce, pomáháte více, než si možná myslíte. Část z každé registrace putuje přímo na podporu vybraných charitativních projektů.",
      totalCollected: "Vybrali jsme",
      donors: "dárců",
      perDonor: "za dárce",
      donateButton: "Přispět do kasičky",
      donated: "Děkujeme za váš příspěvek!",
      thankYou: "Váš dar byl přidán do kasičky!",
      currency: "Kč",
      splitInfo: "Příspěvek rozdělíme rovnoměrně mezi obě charity",
      charityFor: "Pro",
    },
    en: {
      sectionTitle: "Charity Contribution",
      sectionSubtitle: "Your participation matters",
      intro: "By attending this event, you are helping more than you might think. Part of each registration goes directly to support selected charitable projects.",
      totalCollected: "We collected",
      donors: "donors",
      perDonor: "per donor",
      donateButton: "Drop into the jar",
      donated: "Thank you for your contribution!",
      thankYou: "Your donation was added to the jar!",
      currency: "CZK",
      splitInfo: "Your contribution will be split equally between both charities",
      charityFor: "For",
    },
  };

  const t = content[language];

  const loadData = async () => {
    const { data: charitiesData } = await supabase
      .from("charities")
      .select("*")
      .order("name");

    if (charitiesData) {
      const charitiesWithVotes = await Promise.all(
        charitiesData.map(async (charity) => {
          const { count } = await supabase
            .from("charity_votes")
            .select("*", { count: "exact", head: true })
            .eq("charity_id", charity.id);
          return { ...charity, votes: count || 0 };
        })
      );
      setCharities(charitiesWithVotes);
    }

    setLoading(false);
  };

  useEffect(() => {
    const savedDonation = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDonation) {
      setHasDonated(true);
    }
  }, []);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("charity_votes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "charity_votes" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDonate = async () => {
    if (hasDonated || donating || charities.length < 2) return;

    setDonating(true);
    setShowCoins(true);
    setCoinTrigger((prev) => prev + 1);

    // Insert votes for both charities (equal split)
    const insertPromises = charities.map((charity) =>
      supabase
        .from("charity_votes")
        .insert({ charity_id: charity.id })
        .select("id")
        .single()
    );

    const results = await Promise.all(insertPromises);
    const allSuccessful = results.every((r) => !r.error && r.data);

    if (allSuccessful) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ donatedAt: new Date().toISOString() }));
      setHasDonated(true);
      setJustDonated(true);

      setTimeout(() => {
        setJustDonated(false);
        setShowCoins(false);
      }, 3000);

      await loadData();
    }

    setDonating(false);
  };

  // Calculate totals - each donor creates 2 votes (one per charity)
  const totalVotes = charities.reduce((sum, c) => sum + c.votes, 0);
  const totalDonors = Math.floor(totalVotes / 2);
  const totalAmount = totalDonors * AMOUNT_PER_DONOR;

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(language === "cs" ? "cs-CZ" : "en-US").replace(/,/g, " ");
  };

  // Generate coins for animation
  const coins = [...Array(12)].map((_, i) => ({
    id: `${coinTrigger}-${i}`,
    delay: Math.random() * 0.8,
    left: 20 + Math.random() * 60,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
          <div className="h-16 bg-gray-200 rounded-xl w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
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

      {/* Divider */}
      <div className="w-16 h-0.5 bg-gradient-to-r from-[#6cc4cc] to-[#405196] mx-auto mb-6" />

      {/* Collection Jar Visual */}
      <div className="relative flex flex-col items-center mb-8">
        {/* Falling coins animation */}
        {showCoins && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {coins.map((coin) => (
              <FallingCoin key={coin.id} delay={coin.delay} left={coin.left} />
            ))}
          </div>
        )}

        {/* The "Jar" / Pile visual */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#6cc4cc]/20 to-[#405196]/20 rounded-3xl blur-xl scale-110" />
          
          {/* Main jar container */}
          <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-3xl border-4 border-dashed border-gray-300 p-6 sm:p-8 min-w-[280px]">
            {/* Coin pile emoji decoration */}
            <div className="text-center mb-4">
              <span className="text-5xl">💰</span>
            </div>

            {/* Amount display */}
            <div className="text-center">
              <p className="text-gray-500 uppercase tracking-wider text-xs font-medium mb-2">
                {t.totalCollected}
              </p>
              <div className={cn(
                "text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#6cc4cc] to-[#405196] bg-clip-text text-transparent",
                justDonated && "animate-bounce"
              )}>
                {formatAmount(totalAmount)}
                <span className="text-2xl ml-1">{t.currency}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-4 text-gray-500 text-sm mt-4">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span><strong className="text-gray-700">{totalDonors}</strong> {t.donors}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>{AMOUNT_PER_DONOR} {t.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charities info - simple list */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {charities.map((charity, index) => {
            const charityAmount = (charity.votes / 2) * AMOUNT_PER_DONOR;
            const color = index === 0 ? "text-[#6cc4cc]" : "text-[#405196]";
            const bgColor = index === 0 ? "bg-[#6cc4cc]" : "bg-[#405196]";

            return (
              <div key={charity.id} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0", bgColor)} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">{charity.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{charity.description}</p>
                  <p className={cn("font-bold text-sm mt-1", color)}>
                    {formatAmount(charityAmount)} {t.currency}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thank you message */}
      {justDonated && (
        <div className="bg-gradient-to-r from-[#6cc4cc]/10 to-[#405196]/10 border border-[#6cc4cc]/30 rounded-xl p-4 text-center animate-scale-in mb-6">
          <p className="text-[#6cc4cc] font-medium flex items-center justify-center gap-2">
            <span className="text-xl">🎉</span>
            {t.thankYou}
          </p>
        </div>
      )}

      {/* Donate Button or Thank You */}
      <div className="text-center">
        {hasDonated ? (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-center gap-2 text-[#6cc4cc] font-semibold text-lg mb-1">
              <Heart className="w-6 h-6 fill-[#6cc4cc]" />
              {t.donated}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleDonate}
              disabled={donating || charities.length < 2}
              className={cn(
                "group relative w-full max-w-sm py-4 px-8 rounded-xl font-bold text-lg transition-all",
                "bg-gradient-to-r from-[#6cc4cc] to-[#405196] text-white",
                "hover:shadow-xl hover:scale-[1.02] hover:brightness-110",
                "active:scale-95 disabled:opacity-50 shadow-lg",
                "flex items-center justify-center gap-3 mx-auto overflow-hidden"
              )}
            >
              {/* Coin animation on button */}
              <span className={cn(
                "text-2xl transition-transform duration-300",
                donating ? "animate-coin-drop" : "group-hover:animate-coin-wiggle"
              )}>
                🪙
              </span>
              {donating ? "..." : t.donateButton}
            </button>
            <p className="text-xs text-gray-500">{t.splitInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CharityVoting;