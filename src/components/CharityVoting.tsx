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
      sectionTitle: "Charitativní příspěvek",
      sectionSubtitle: "Vaše účast má smysl",
      intro: "Tím, že jste se zúčastnili této akce, pomáháte více, než si možná myslíte. Část z každé registrace putuje přímo na podporu vybraných charitativních projektů. Rozhodněte, kam váš příspěvek poputuje.",
      totalDonation: "Celkový příspěvek Uniters",
      basedOn: "Na základě",
      attendees: "účastníků",
      perAttendee: "za účastníka",
      voteButton: "Hlasovat",
      voted: "Váš hlas",
      thankYou: "Děkujeme za váš hlas!",
      currency: "Kč",
    },
    en: {
      sectionTitle: "Charity Contribution",
      sectionSubtitle: "Your participation matters",
      intro: "By attending this event, you are helping more than you might think. Part of each registration goes directly to support selected charitable projects. Decide where your contribution will go.",
      totalDonation: "Total Uniters Donation",
      basedOn: "Based on",
      attendees: "attendees",
      perAttendee: "per attendee",
      voteButton: "Vote",
      voted: "Your vote",
      thankYou: "Thank you for your vote!",
      currency: "CZK",
    },
  };

  const t = content[language];

  // Charity colors - teal and navy
  const charityColors = [
    { bg: "bg-[#6cc4cc]", text: "text-[#6cc4cc]" },
    { bg: "bg-[#405196]", text: "text-[#405196]" },
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
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
      {/* Charity accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6cc4cc] to-[#405196]" />
      
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
        <div className="bg-gradient-to-r from-[#6cc4cc] to-[#405196] rounded-xl px-8 py-4 inline-block mb-4">
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
        <div className="bg-[#6cc4cc]/10 border border-[#6cc4cc]/30 rounded-xl p-4 text-center animate-scale-in mb-6">
          <p className="text-[#6cc4cc] font-medium flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-[#6cc4cc]" />
            {t.thankYou}
          </p>
        </div>
      )}

      {/* Charity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {charities.map((charity, index) => {
          const isVotedCharity = votedCharityId === charity.id;
          const wasJustVoted = justVoted === charity.id;
          const charityAmount = charity.votes * AMOUNT_PER_VOTE;
          const colors = charityColors[index % charityColors.length];

          return (
            <div
              key={charity.id}
              className={cn(
                "bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 border border-gray-100",
                wasJustVoted && "animate-vote-success",
                isVotedCharity && "ring-2 ring-[#6cc4cc] ring-offset-2"
              )}
            >
              {/* Colored top bar */}
              <div className={cn("h-2", colors.bg)} />
              
              <div className="p-5 text-center">
                {/* Charity name */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                  {charity.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 text-sm mb-3">
                  {charity.description}
                </p>

                {/* Amount pill */}
                <div className={cn("inline-block rounded-full px-5 py-2 mb-4", colors.bg)}>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {formatAmount(charityAmount)}
                  </span>
                  <span className="text-white/90 text-sm ml-1">{t.currency}</span>
                </div>

                {/* Vote button or status */}
                {hasVoted ? (
                  isVotedCharity ? (
                    <div className="flex items-center justify-center gap-2 text-[#6cc4cc] font-medium py-2">
                      <Heart className="w-5 h-5 fill-[#6cc4cc]" />
                      {t.voted}
                    </div>
                  ) : (
                    <div className="py-2" />
                  )
                ) : (
                  <button
                    onClick={() => handleVote(charity.id)}
                    disabled={voting}
                    className={cn(
                      "w-full py-3 rounded-xl font-semibold transition-all",
                      "bg-[#405196] text-white",
                      "hover:bg-[#4a5ca8] hover:scale-[1.02]",
                      "active:scale-95 disabled:opacity-50 shadow-md"
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Heart className="w-5 h-5" />
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