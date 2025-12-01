"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationMenu } from "@/components/navigation-menu";
import { PoroRating } from "@/components/poro-rating";
import { Clock, MessageSquare, Loader2 } from "lucide-react";

interface Review {
  id: string;
  summoner_name: string;
  region: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function RecentPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/stats/recent-reviews");
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching recent reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecent();
  }, []);

  const handleReviewClick = (review: Review) => {
    // Parse summoner_name which is in format "Name#TAG"
    const [gameName, tagLine] = review.summoner_name.split("#");
    if (gameName && tagLine) {
      router.push(
        `/player/${encodeURIComponent(gameName)}-${encodeURIComponent(
          tagLine
        )}?region=${review.region}`
      );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <main className="min-h-screen">
      <NavigationMenu />

      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter
              id="aurora-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
            <linearGradient
              id="aurora-gradient-1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgb(139, 92, 246)"
                stopOpacity="0.25"
              />
              <stop
                offset="50%"
                stopColor="rgb(167, 139, 250)"
                stopOpacity="0.12"
              />
              <stop
                offset="100%"
                stopColor="rgb(196, 181, 253)"
                stopOpacity="0.05"
              />
            </linearGradient>
            <linearGradient
              id="aurora-gradient-2"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgb(124, 58, 237)"
                stopOpacity="0.2"
              />
              <stop
                offset="50%"
                stopColor="rgb(139, 92, 246)"
                stopOpacity="0.1"
              />
              <stop
                offset="100%"
                stopColor="rgb(91, 33, 182)"
                stopOpacity="0.05"
              />
            </linearGradient>
            <linearGradient
              id="aurora-gradient-3"
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="rgb(192, 132, 252)"
                stopOpacity="0.15"
              />
              <stop
                offset="100%"
                stopColor="rgb(126, 34, 206)"
                stopOpacity="0.03"
              />
            </linearGradient>
          </defs>
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute inset-0 bg-radial-gradient" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Recent Reviews</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Latest player reviews from the community
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && reviews.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Be the first to review a player
            </p>
          </div>
        )}

        {/* Reviews list */}
        {!isLoading && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((review) => {
              const [gameName, tagLine] = review.summoner_name.split("#");

              return (
                <button
                  key={review.id}
                  onClick={() => handleReviewClick(review)}
                  className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200 text-left group"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {gameName}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        #{tagLine}
                      </span>
                      <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded">
                        {review.region.toUpperCase().replace("1", "")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/60">
                      {formatTimeAgo(review.created_at)}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="mb-2">
                    <PoroRating value={review.rating} readonly size="sm" />
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      &quot;{review.comment}&quot;
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
