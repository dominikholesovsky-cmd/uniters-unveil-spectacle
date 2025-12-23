import { useState, useEffect } from "react";
import { Heart, Check, Sparkles, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Charity {
  id: string;
  name: string;
  description: string;
  votes: number;
}

interface VotingToken {
  id: string;
  valid: boolean;
  reason?: "used" | "not_found";
}

interface CharityVotingProps {
  language: "cs" | "en";
  votingToken: VotingToken | null;
}

const AMOUNT_PER_VOTE = 500;

export function CharityVoting({ language, votingToken }: CharityVotingProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const content = {
    cs: {
      title: "Hlasování o charitu",
      subtitle: "Váš hlas = 500 Kč pro vybranou charitu",
      totalCollected: "Celkem vybráno",
      currency: "Kč",
      voteButton: "Hlasovat",
      voted: "Váš hlas",
      votes: "hlasů",
      alreadyVoted: "Již jste hlasovali",
      thankYou: "Děkujeme za váš hlas!",
      scanQrCode: "Naskenujte QR kód na vstupence pro hlasování",
      qrCodeUsed: "Tento QR kód byl již použit",
      invalidQrCode: "Neplatný QR kód",
    },
    en: {
      title: "Charity Voting",
      subtitle: "Your vote = 500 CZK for the selected charity",
      totalCollected: "Total collected",
      currency: "CZK",
      voteButton: "Vote",
      voted: "Your vote",
      votes: "votes",
      alreadyVoted: "You have already voted",
      thankYou: "Thank you for your vote!",
      scanQrCode: "Scan the QR code on your ticket to vote",
      qrCodeUsed: "This QR code has already been used",
      invalidQrCode: "Invalid QR code",
    },
  };

  const t = content[language];

  const loadData = async () => {
    // Load charities with vote counts
    const { data: charitiesData } = await supabase
      .from("charities")
      .select("*")
      .order("name");

    if (charitiesData) {
      // Get vote counts for each charity
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

    // Check if token was already used for voting
    if (votingToken?.valid && votingToken.id) {
      const { data: voteData } = await supabase
        .from("charity_votes")
        .select("id")
        .eq("token_id", votingToken.id)
        .maybeSingle();

      if (voteData) {
        setHasVoted(true);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime updates
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
  }, [votingToken]);

  const handleVote = async (charityId: string) => {
    if (!votingToken?.valid || hasVoted || voting) return;

    setVoting(true);

    // Insert vote
    const { error: voteError } = await supabase.from("charity_votes").insert({
      charity_id: charityId,
      token_id: votingToken.id,
    });

    if (!voteError) {
      // Mark token as used
      await supabase
        .from("voting_tokens")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", votingToken.id);

      setHasVoted(true);
      setJustVoted(charityId);
      setShowConfetti(true);

      // Reset animations after delay
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

  // Determine the message to show based on token state
  const canVote = votingToken?.valid && !hasVoted && !voting;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="grid gap-4 mt-6">
            <div className="h-40 bg-gray-200 rounded-xl" />
            <div className="h-40 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Confetti animation overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20">
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
                className="text-amber-400"
                style={{
                  width: `${12 + Math.random() * 12}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Total Amount Display */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 mb-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 animate-pulse-slow" />
        <p className="text-sm uppercase tracking-wider opacity-90 mb-1">
          {t.totalCollected}
        </p>
        <p className="text-4xl sm:text-5xl font-bold tracking-tight">
          {totalAmount.toLocaleString(language === "cs" ? "cs-CZ" : "en-US")}{" "}
          <span className="text-2xl">{t.currency}</span>
        </p>
      </div>

      {/* No token - show scan QR message */}
      {!votingToken && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <QrCode className="w-5 h-5" />
            <p>{t.scanQrCode}</p>
          </div>
        </div>
      )}

      {/* Token used - show already used message */}
      {votingToken && !votingToken.valid && votingToken.reason === "used" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-amber-700">{t.qrCodeUsed}</p>
        </div>
      )}

      {/* Invalid token */}
      {votingToken && !votingToken.valid && votingToken.reason === "not_found" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-700">{t.invalidQrCode}</p>
        </div>
      )}

      {/* Thank you message */}
      {justVoted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-center animate-scale-in">
          <p className="text-emerald-700 font-medium flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-emerald-500 text-emerald-500" />
            {t.thankYou}
          </p>
        </div>
      )}

      {/* Charity Cards */}
      <div className="grid gap-4">
        {charities.map((charity) => {
          const wasJustVoted = justVoted === charity.id;
          const charityAmount = charity.votes * AMOUNT_PER_VOTE;

          return (
            <div
              key={charity.id}
              className={cn(
                "relative rounded-xl border-2 p-5 transition-all duration-500",
                wasJustVoted
                  ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300",
                wasJustVoted && "animate-vote-success",
                canVote && "cursor-pointer hover:scale-[1.02] hover:shadow-md"
              )}
              onClick={() => canVote && handleVote(charity.id)}
            >
              {/* Voted badge */}
              {wasJustVoted && (
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-2 shadow-lg animate-scale-in">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {charity.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{charity.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Amount for this charity */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      {charityAmount.toLocaleString(
                        language === "cs" ? "cs-CZ" : "en-US"
                      )}{" "}
                      {t.currency}
                    </p>
                    <p className="text-xs text-gray-500">
                      {charity.votes} {t.votes}
                    </p>
                  </div>

                  {/* Vote button or status */}
                  {hasVoted ? (
                    <span className="text-gray-400 text-sm">{t.alreadyVoted}</span>
                  ) : canVote ? (
                    <button
                      disabled={voting}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all",
                        "bg-emerald-500 text-white hover:bg-emerald-600",
                        "active:scale-95 disabled:opacity-50"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        {t.voteButton}
                      </span>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    wasJustVoted ? "bg-emerald-500" : "bg-emerald-400"
                  )}
                  style={{
                    width: `${totalVotes > 0 ? (charity.votes / totalVotes) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CharityVoting;
