import { useState, useEffect } from "react";
import { Heart, Users, Coins, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Charity {
  id: string;
  name: string;
  description: string;
  votes: number;
}

interface CharityVotingProps {
  language: "cs" | "en";
}

const AMOUNT_PER_VOTE = 500;
const LOCAL_STORAGE_KEY = "uniters_charity_vote";

export function CharityVoting({ language }: CharityVotingProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCharityId, setVotedCharityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const content = {
    cs: {
      totalDonation: "Celkový příspěvek Uniters",
      basedOn: "Na základě",
      attendees: "účastníků",
      perAttendee: "za účastníka",
      chooseYourCause: "Vyberte svůj projekt",
      voteButton: "Hlasovat",
      voted: "Váš hlas",
      thankYou: "Děkujeme za váš hlas!",
      currency: "Kč",
    },
    en: {
      totalDonation: "Total Uniters Donation",
      basedOn: "Based on",
      attendees: "attendees",
      perAttendee: "per attendee",
      chooseYourCause: "Choose your cause",
      voteButton: "Vote",
      voted: "Your vote",
      thankYou: "Thank you for your vote!",
      currency: "CZK",
    },
  };

  const t = content[language];

  // Charity colors - teal and coral
  const charityColors = [
    { bg: "bg-[#6cc4cc]", text: "text-[#6cc4cc]" },
    { bg: "bg-[#e07a5f]", text: "text-[#e07a5f]" },
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
    const savedVote = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedVote) {
      setHasVoted(true);
      try {
        const parsed = JSON.parse(savedVote);
        setVotedCharityId(parsed.charityId || savedVote);
      } catch {
        setVotedCharityId(savedVote);
      }
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

  const handleVote = async (charityId: string) => {
    if (hasVoted || voting) return;

    setVoting(true);

    const { data: voteData, error: voteError } = await supabase
      .from("charity_votes")
      .insert({ charity_id: charityId })
      .select("id")
      .single();

    if (!voteError && voteData) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ charityId, voteId: voteData.id }));
      setHasVoted(true);
      setVotedCharityId(charityId);
      setJustVoted(charityId);
      setShowConfetti(true);

      setTimeout(() => {
        setJustVoted(null);
        setShowConfetti(false);
      }, 3000);

      await loadData();
    }

    setVoting(false);
  };

  const totalVotes = charities.reduce((sum, c) => sum + c.votes, 0);
  const totalAmount = totalVotes * AMOUNT_PER_VOTE;

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
    <div className="space-y-8 relative">
      {/* Confetti animation overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              <Sparkles
                className="text-[#6cc4cc]"
                style={{
                  width: `${12 + Math.random() * 12}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Total Donation Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-center">
        <p className="text-gray-500 uppercase tracking-wider text-sm font-medium mb-4">
          {t.totalDonation}
        </p>
        
        {/* Big Total Amount */}
        <div className="bg-[#6cc4cc] rounded-xl px-8 py-4 inline-block mb-4">
          <span className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {formatAmount(totalAmount)}
          </span>
          <span className="text-white/90 text-lg ml-2">{t.currency}</span>
        </div>

        {/* Individual charity amounts */}
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          {charities.map((charity, index) => (
            <div key={charity.id} className="flex items-center gap-3">
              {index > 0 && <span className="text-gray-400 font-medium">+</span>}
              <span className={cn("font-semibold", charityColors[index % charityColors.length].text)}>
                {formatAmount(charity.votes * AMOUNT_PER_VOTE)} {t.currency}
              </span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 text-gray-500 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{t.basedOn} <strong className="text-gray-700">{totalVotes}</strong> {t.attendees}</span>
          </div>
          <span className="text-gray-300">×</span>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            <span><strong className="text-gray-700">{AMOUNT_PER_VOTE}</strong> {t.currency} {t.perAttendee}</span>
          </div>
        </div>
      </div>

      {/* Thank you message */}
      {justVoted && (
        <div className="bg-[#6cc4cc]/10 border border-[#6cc4cc]/30 rounded-xl p-4 text-center animate-scale-in">
          <p className="text-[#6cc4cc] font-medium flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-[#6cc4cc]" />
            {t.thankYou}
          </p>
        </div>
      )}

      {/* Section Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
        {t.chooseYourCause}
      </h2>

      {/* Charity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {charities.map((charity, index) => {
          const isVotedCharity = votedCharityId === charity.id;
          const wasJustVoted = justVoted === charity.id;
          const charityAmount = charity.votes * AMOUNT_PER_VOTE;
          const colors = charityColors[index % charityColors.length];

          return (
            <div
              key={charity.id}
              onClick={() => !hasVoted && handleVote(charity.id)}
              className={cn(
                "bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300",
                !hasVoted && "cursor-pointer hover:scale-[1.02] hover:shadow-xl",
                wasJustVoted && "animate-vote-success",
                isVotedCharity && "ring-2 ring-[#6cc4cc] ring-offset-2"
              )}
            >
              {/* Colored top bar */}
              <div className={cn("h-2", colors.bg)} />
              
              <div className="p-6 text-center">
                {/* Charity name */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {charity.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 text-sm mb-4">
                  {charity.description}
                </p>

                {/* Amount pill */}
                <div className={cn("inline-block rounded-full px-6 py-3 mb-4", colors.bg)}>
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {formatAmount(charityAmount)}
                  </span>
                  <span className="text-white/90 text-sm ml-1">{t.currency}</span>
                </div>

                {/* Vote button or status */}
                {hasVoted ? (
                  isVotedCharity ? (
                    <div className="flex items-center justify-center gap-2 text-[#6cc4cc] font-medium">
                      <Heart className="w-5 h-5 fill-[#6cc4cc]" />
                      {t.voted}
                    </div>
                  ) : null
                ) : (
                  <button
                    disabled={voting}
                    className={cn(
                      "w-full py-3 rounded-xl font-medium transition-all border-2",
                      "border-gray-200 text-gray-600 bg-gray-50",
                      "hover:border-[#6cc4cc] hover:text-[#6cc4cc] hover:bg-[#6cc4cc]/5",
                      "active:scale-95 disabled:opacity-50"
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" />
                      {t.voteButton}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CharityVoting;