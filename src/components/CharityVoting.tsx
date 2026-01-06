import { useState, useEffect } from "react";
import { Heart, Users } from "lucide-react";
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

// Falling coin component
const FallingCoin = ({ delay, left, size }: { delay: number; left: number; size: number }) => (
  <div
    className="absolute pointer-events-none animate-coin-fall"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      top: "-20px",
      fontSize: `${size}rem`,
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
  const [coinKey, setCoinKey] = useState(0);

  const content = {
    cs: {
      sectionTitle: "Charitativní příspěvek",
      sectionSubtitle: "Vaše účast má smysl",
      intro: "Tím, že jste se zúčastnili této akce, pomáháte více, než si možná myslíte. Část z každé registrace putuje přímo na podporu vybraných charitativních projektů.",
      totalCollected: "V kasičce máme",
      donors: "dárců",
      donateButton: "Hodit do kasičky",
      donated: "Děkujeme za váš příspěvek!",
      thankYou: "Vaše mince přistála v kasičce!",
      currency: "Kč",
      splitInfo: "Příspěvek rozdělíme rovnoměrně mezi obě charity",
    },
    en: {
      sectionTitle: "Charity Contribution",
      sectionSubtitle: "Your participation matters",
      intro: "By attending this event, you are helping more than you might think. Part of each registration goes directly to support selected charitable projects.",
      totalCollected: "In the jar we have",
      donors: "donors",
      donateButton: "Drop into the jar",
      donated: "Thank you for your contribution!",
      thankYou: "Your coin landed in the jar!",
      currency: "CZK",
      splitInfo: "Your contribution will be split equally between both charities",
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
    setCoinKey(prev => prev + 1);

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

  // Calculate totals
  const totalVotes = charities.reduce((sum, c) => sum + c.votes, 0);
  const totalDonors = Math.floor(totalVotes / 2);
  const totalAmount = totalDonors * AMOUNT_PER_DONOR;

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(language === "cs" ? "cs-CZ" : "en-US").replace(/,/g, " ");
  };

  // Generate random coins for animation
  const coins = [...Array(10)].map((_, i) => ({
    id: `${coinKey}-${i}`,
    delay: Math.random() * 0.6,
    left: 15 + Math.random() * 70,
    size: 0.8 + Math.random() * 0.8,
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

      {/* Money Jar / Pile Visual */}
      <div className="relative mb-8">
        <div className="relative bg-gradient-to-b from-amber-50 to-amber-100/50 rounded-2xl p-6 border-2 border-dashed border-amber-300/60 overflow-hidden">
          {/* Falling coins animation */}
          {showCoins && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              {coins.map((coin) => (
                <FallingCoin key={coin.id} delay={coin.delay} left={coin.left} size={coin.size} />
              ))}
            </div>
          )}

          {/* Coin pile visual */}
          <div className="relative z-10 text-center">
            {/* Coin stack emoji visual */}
            <div className="flex items-end justify-center gap-1 mb-4">
              <span className="text-3xl opacity-60">🪙</span>
              <span className="text-4xl opacity-70">🪙</span>
              <span className="text-5xl">💰</span>
              <span className="text-4xl opacity-70">🪙</span>
              <span className="text-3xl opacity-60">🪙</span>
            </div>

            {/* Amount display */}
            <p className="text-gray-600 uppercase tracking-wider text-xs font-medium mb-1">
              {t.totalCollected}
            </p>
            <div className={cn(
              "text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#6cc4cc] to-[#405196] bg-clip-text text-transparent transition-transform",
              justDonated && "animate-bounce"
            )}>
              {formatAmount(totalAmount)}
              <span className="text-xl ml-1">{t.currency}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-2">
              <Users className="w-4 h-4" />
              <span><strong className="text-gray-700">{totalDonors}</strong> {t.donors}</span>
            </div>
          </div>

          {/* Decorative coins at the bottom */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-0.5 opacity-40">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-lg" style={{ transform: `rotate(${(i - 4) * 15}deg)` }}>🪙</span>
            ))}
          </div>
        </div>
      </div>

      {/* Charities - Simple cards */}
      <div className="space-y-3 mb-6">
        {charities.map((charity, index) => {
          const charityAmount = (charity.votes / 2) * AMOUNT_PER_DONOR;
          const isFirst = index === 0;
          const color = isFirst ? "#6cc4cc" : "#405196";
          const bgColor = isFirst ? "bg-[#6cc4cc]/10" : "bg-[#405196]/10";
          const borderColor = isFirst ? "border-[#6cc4cc]/40" : "border-[#405196]/40";

          return (
            <div
              key={charity.id}
              className={cn(
                "rounded-xl p-4 border-l-4 transition-all",
                bgColor,
                borderColor
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 mb-1">{charity.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{charity.description}</p>
                </div>
                <div 
                  className="text-lg sm:text-xl font-bold whitespace-nowrap"
                  style={{ color }}
                >
                  {formatAmount(charityAmount)} {t.currency}
                </div>
              </div>
            </div>
          );
        })}
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
            <div className="flex items-center justify-center gap-2 text-[#6cc4cc] font-semibold text-lg">
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
              {/* Coin with drop animation */}
              <span className={cn(
                "text-2xl transition-transform",
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