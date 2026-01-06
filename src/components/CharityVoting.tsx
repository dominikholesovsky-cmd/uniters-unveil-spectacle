import { useState, useEffect } from "react";
import { Heart, Users, Coins, Sparkles } from "lucide-react";
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

export function CharityVoting({ language }: CharityVotingProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [hasDonated, setHasDonated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [justDonated, setJustDonated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const content = {
    cs: {
      sectionTitle: "Charitativní příspěvek",
      sectionSubtitle: "Vaše účast má smysl",
      intro: "Tím, že jste se zúčastnili této akce, pomáháte více, než si možná myslíte. Část z každé registrace putuje přímo na podporu vybraných charitativních projektů.",
      totalDonation: "Celkový příspěvek Uniters",
      donors: "dárců",
      perDonor: "za dárce",
      donateButton: "Darovat a podpořit",
      donated: "Děkujeme za váš příspěvek!",
      thankYou: "Váš dar byl úspěšně přidán!",
      currency: "Kč",
      splitInfo: "Váš příspěvek bude rozdělen rovnoměrně mezi obě charity",
    },
    en: {
      sectionTitle: "Charity Contribution",
      sectionSubtitle: "Your participation matters",
      intro: "By attending this event, you are helping more than you might think. Part of each registration goes directly to support selected charitable projects.",
      totalDonation: "Total Uniters Donation",
      donors: "donors",
      perDonor: "per donor",
      donateButton: "Donate & Support",
      donated: "Thank you for your contribution!",
      thankYou: "Your donation has been added!",
      currency: "CZK",
      splitInfo: "Your contribution will be split equally between both charities",
    },
  };

  const t = content[language];

  // Charity colors - teal and navy
  const charityColors = [
    { bg: "bg-[#6cc4cc]", barBg: "bg-[#6cc4cc]", text: "text-[#6cc4cc]" },
    { bg: "bg-[#405196]", barBg: "bg-[#405196]", text: "text-[#405196]" },
  ];

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
      setShowConfetti(true);

      setTimeout(() => {
        setJustDonated(false);
        setShowConfetti(false);
      }, 4000);

      await loadData();
    }

    setDonating(false);
  };

  // Calculate totals - each donor creates 2 votes (one per charity)
  const totalVotes = charities.reduce((sum, c) => sum + c.votes, 0);
  const totalDonors = Math.floor(totalVotes / 2);
  const totalAmount = totalDonors * AMOUNT_PER_DONOR;
  const maxVotes = Math.max(...charities.map((c) => c.votes), 1);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(language === "cs" ? "cs-CZ" : "en-US").replace(/,/g, " ");
  };

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
      
      {/* Confetti animation overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            >
              <Sparkles
                className={i % 2 === 0 ? "text-[#6cc4cc]" : "text-[#405196]"}
                style={{
                  width: `${14 + Math.random() * 14}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

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

      {/* Total Donation Header */}
      <div className="text-center mb-6">
        <p className="text-gray-500 uppercase tracking-wider text-xs font-medium mb-3">
          {t.totalDonation}
        </p>
        
        {/* Big Total Amount */}
        <div className="bg-gradient-to-r from-[#6cc4cc] to-[#405196] rounded-xl px-8 py-5 inline-block mb-4 shadow-lg">
          <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {formatAmount(totalAmount)}
          </span>
          <span className="text-white/90 text-xl ml-2">{t.currency}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 text-gray-500 text-sm flex-wrap mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span><strong className="text-gray-700 text-lg">{totalDonors}</strong> {t.donors}</span>
          </div>
          <span className="text-gray-300">×</span>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            <span><strong className="text-gray-700">{AMOUNT_PER_DONOR}</strong> {t.currency} {t.perDonor}</span>
          </div>
        </div>
      </div>

      {/* Charity Progress Bars */}
      <div className="space-y-5 mb-8">
        {charities.map((charity, index) => {
          const charityAmount = (charity.votes / 2) * AMOUNT_PER_DONOR;
          const progress = (charity.votes / maxVotes) * 100;
          const colors = charityColors[index % charityColors.length];

          return (
            <div key={charity.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{charity.name}</h3>
                  <p className="text-xs text-gray-500">{charity.description}</p>
                </div>
                <div className={cn("font-bold text-lg", colors.text)}>
                  {formatAmount(charityAmount)} {t.currency}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    colors.barBg
                  )}
                  style={{ width: `${Math.max(progress, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Thank you message */}
      {justDonated && (
        <div className="bg-gradient-to-r from-[#6cc4cc]/10 to-[#405196]/10 border border-[#6cc4cc]/30 rounded-xl p-4 text-center animate-scale-in mb-6">
          <p className="text-[#6cc4cc] font-medium flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-[#6cc4cc]" />
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
                "w-full max-w-sm py-4 px-8 rounded-xl font-bold text-lg transition-all",
                "bg-gradient-to-r from-[#6cc4cc] to-[#405196] text-white",
                "hover:shadow-xl hover:scale-[1.02] hover:brightness-110",
                "active:scale-95 disabled:opacity-50 shadow-lg",
                "flex items-center justify-center gap-3 mx-auto"
              )}
            >
              <Heart className="w-6 h-6" />
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