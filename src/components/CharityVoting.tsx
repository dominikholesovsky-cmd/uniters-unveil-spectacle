import { useState, useEffect } from "react";
import { Heart, Check, Sparkles, RotateCcw } from "lucide-react";
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

interface StoredVote {
  charityId: string;
  voteId: string;
}

const AMOUNT_PER_VOTE = 500;
const LOCAL_STORAGE_KEY = "uniters_charity_vote";

export function CharityVoting({ language }: CharityVotingProps) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCharityId, setVotedCharityId] = useState<string | null>(null);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      changeVote: "Změnit hlas",
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
      changeVote: "Change vote",
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

    setLoading(false);
  };

  // Check local storage for existing vote
  useEffect(() => {
    const savedVoteRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedVoteRaw) {
      try {
        const savedVote: StoredVote = JSON.parse(savedVoteRaw);
        setHasVoted(true);
        setVotedCharityId(savedVote.charityId);
        setVoteId(savedVote.voteId);
      } catch {
        // Legacy format (just charityId string)
        setHasVoted(true);
        setVotedCharityId(savedVoteRaw);
      }
    }
  }, []);

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
  }, []);

  const handleVote = async (charityId: string) => {
    if (hasVoted || voting) return;

    setVoting(true);

    // Insert vote (without token)
    const { data: voteData, error: voteError } = await supabase
      .from("charity_votes")
      .insert({
        charity_id: charityId,
        token_id: crypto.randomUUID(),
      })
      .select("id")
      .single();

    if (!voteError && voteData) {
      // Save to local storage with vote ID
      const storedVote: StoredVote = {
        charityId,
        voteId: voteData.id,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedVote));
      setHasVoted(true);
      setVotedCharityId(charityId);
      setVoteId(voteData.id);
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

  const handleDeleteVote = async () => {
    if (!voteId || deleting) return;

    setDeleting(true);

    const { error } = await supabase
      .from("charity_votes")
      .delete()
      .eq("id", voteId);

    if (!error) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setHasVoted(false);
      setVotedCharityId(null);
      setVoteId(null);
      await loadData();
    }

    setDeleting(false);
  };

  const totalVotes = charities.reduce((sum, c) => sum + c.votes, 0);
  const totalAmount = totalVotes * AMOUNT_PER_VOTE;

  const canVote = !hasVoted && !voting;

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
          <div className="grid gap-4 mt-6">
            <div className="h-40 bg-muted rounded-xl" />
            <div className="h-40 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
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
                className="text-primary"
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
        <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
          {t.title}
        </h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Total Amount Display */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 mb-6 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 animate-pulse-slow" />
        <p className="text-sm uppercase tracking-wider opacity-90 mb-1">
          {t.totalCollected}
        </p>
        <p className="text-4xl sm:text-5xl font-bold tracking-tight">
          {totalAmount.toLocaleString(language === "cs" ? "cs-CZ" : "en-US")}{" "}
          <span className="text-2xl">{t.currency}</span>
        </p>
      </div>

      {/* Thank you message */}
      {justVoted && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 text-center animate-scale-in">
          <p className="text-primary font-medium flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-primary text-primary" />
            {t.thankYou}
          </p>
        </div>
      )}

      {/* Charity Cards */}
      <div className="grid gap-4">
        {charities.map((charity) => {
          const wasJustVoted = justVoted === charity.id;
          const isVotedCharity = votedCharityId === charity.id;
          const charityAmount = charity.votes * AMOUNT_PER_VOTE;

          return (
            <div
              key={charity.id}
              className={cn(
                "relative rounded-xl border-2 p-5 transition-all duration-500",
                wasJustVoted || isVotedCharity
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-muted/30 hover:border-primary/50",
                wasJustVoted && "animate-vote-success",
                canVote && "cursor-pointer hover:scale-[1.02] hover:shadow-md"
              )}
              onClick={() => canVote && handleVote(charity.id)}
            >
              {/* Voted badge */}
              {(wasJustVoted || isVotedCharity) && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-scale-in">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-card-foreground mb-1">
                    {charity.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{charity.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Amount for this charity */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {charityAmount.toLocaleString(
                        language === "cs" ? "cs-CZ" : "en-US"
                      )}{" "}
                      {t.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {charity.votes} {t.votes}
                    </p>
                  </div>

                  {/* Vote button or status */}
                  {hasVoted ? (
                    isVotedCharity ? (
                      <span className="text-primary text-sm font-medium">{t.voted}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">{t.alreadyVoted}</span>
                    )
                  ) : canVote ? (
                    <button
                      disabled={voting}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all",
                        "bg-primary text-primary-foreground hover:bg-primary/90",
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
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    wasJustVoted || isVotedCharity ? "bg-primary" : "bg-primary/70"
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

      {/* Change vote button */}
      {hasVoted && voteId && (
        <div className="mt-6 text-center">
          <button
            onClick={handleDeleteVote}
            disabled={deleting}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all text-sm",
              "border border-muted-foreground/30 text-muted-foreground",
              "hover:border-primary hover:text-primary",
              "active:scale-95 disabled:opacity-50"
            )}
          >
            <span className="flex items-center gap-2">
              <RotateCcw className={cn("w-4 h-4", deleting && "animate-spin")} />
              {t.changeVote}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CharityVoting;
