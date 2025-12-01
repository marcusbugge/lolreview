"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PoroRating } from "@/components/poro-rating";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { supabase, Review, isSupabaseConfigured } from "@/lib/supabase";
import { NavigationMenu } from "@/components/navigation-menu";

const REGION_ROUTING: Record<string, string> = {
  euw1: "europe",
  eun1: "europe",
  na1: "americas",
  kr: "asia",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  oc1: "sea",
  tr1: "europe",
  ru: "europe",
  jp1: "asia",
};

interface RankedData {
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
}

interface SummonerData {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  region: string;
  ranked?: RankedData | null;
}

export default function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [summoner, setSummoner] = useState<SummonerData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // New review state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse the ID to get gameName and tagLine
  const [gameName, tagLine] = decodeURIComponent(id).split("-");
  const region = searchParams.get("region") || "euw1";
  const routing = REGION_ROUTING[region] || "europe";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch summoner data
        const summonerRes = await fetch(
          `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&routing=${routing}`
        );

        if (!summonerRes.ok) {
          throw new Error("Player not found");
        }

        const summonerData = await summonerRes.json();
        setSummoner(summonerData);

        // Fetch reviews from Supabase (don't fail if Supabase isn't configured)
        try {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select("*")
            .eq("summoner_name", `${gameName}#${tagLine}`)
            .order("created_at", { ascending: false });

          if (!reviewsError) {
            setReviews(reviewsData || []);
          }
        } catch {
          // Supabase not configured, continue without reviews
          console.log("Supabase not configured");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [gameName, tagLine, region, routing]);

  const [submitError, setSubmitError] = useState("");

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summoner_name: `${gameName}#${tagLine}`,
          region: summoner?.region || "unknown",
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setSubmitError("You have already reviewed this player");
        } else {
          setSubmitError(data.error || "Could not save review. Please try again.");
        }
        return;
      }

      setReviews((prev) => [data, ...prev]);
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Error submitting review:", err);
      setSubmitError("Could not save review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <NavigationMenu />
      
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-background" />
        
        {/* SVG Aurora Effect */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Blur filter */}
            <filter id="aurora-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
            
            {/* Gradient definitions */}
            <linearGradient id="aurora-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.25" />
              <stop offset="50%" stopColor="rgb(167, 139, 250)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="rgb(196, 181, 253)" stopOpacity="0.05" />
            </linearGradient>
            
            <linearGradient id="aurora-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(124, 58, 237)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgb(91, 33, 182)" stopOpacity="0.05" />
            </linearGradient>
            
            <linearGradient id="aurora-gradient-3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgb(192, 132, 252)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="rgb(126, 34, 206)" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          
          {/* Aurora waves */}
          <g filter="url(#aurora-blur)">
            <ellipse 
              cx="20%" 
              cy="30%" 
              rx="40%" 
              ry="25%" 
              fill="url(#aurora-gradient-1)"
              className="animate-aurora-1"
            />
            <ellipse 
              cx="80%" 
              cy="60%" 
              rx="35%" 
              ry="30%" 
              fill="url(#aurora-gradient-2)"
              className="animate-aurora-2"
            />
            <ellipse 
              cx="50%" 
              cy="80%" 
              rx="50%" 
              ry="20%" 
              fill="url(#aurora-gradient-3)"
              className="animate-aurora-3"
            />
          </g>
        </svg>
        
        {/* Additional glow layer */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-radial-gradient" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Player header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner?.profileIconId || 29}.png`}
              alt="Profile Icon"
              className="w-20 h-20 rounded-full ring-2 ring-primary/20"
            />
            {summoner?.summonerLevel ? (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {summoner.summonerLevel}
              </span>
            ) : null}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{summoner?.gameName}</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">#{summoner?.tagLine}</p>
              {summoner?.region && (
                <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded">
                  {summoner.region.toUpperCase().replace("1", "")}
                </span>
              )}
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <PoroRating value={Math.round(averageRating)} readonly size="sm" />
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
          {/* Ranked info */}
          {summoner?.ranked && (
            <div className="flex items-center gap-3">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${summoner.ranked.tier.toLowerCase()}.svg`}
                alt={summoner.ranked.tier}
                className="w-12 h-12"
              />
              <div>
                <div className="font-semibold text-sm">
                  {summoner.ranked.tier.charAt(0) + summoner.ranked.tier.slice(1).toLowerCase()} {summoner.ranked.rank}
                </div>
                <div className="text-xs text-muted-foreground">
                  {summoner.ranked.lp} LP
                </div>
                <div className="text-xs text-muted-foreground">
                  {summoner.ranked.wins}W {summoner.ranked.losses}L
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit review */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Leave a review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center gap-3">
              <PoroRating value={rating} onChange={setRating} size="lg" />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating} / 5 Poros
                </span>
              )}
            </div>
            <Textarea
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-card/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 resize-none"
              rows={3}
            />
            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit review
                </>
              )}
            </Button>
            {submitError && (
              <p className="text-destructive text-sm text-center">{submitError}</p>
            )}
          </form>
        </div>

        {/* Reviews list */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-2xl bg-card/30 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <PoroRating value={review.rating} readonly size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground/80">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
