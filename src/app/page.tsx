"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { PoroRating } from "@/components/poro-rating";
import { NavigationMenu } from "@/components/navigation-menu";

const REGIONS = [
  { value: "euw1", label: "EUW", routing: "europe" },
  { value: "eun1", label: "EUNE", routing: "europe" },
  { value: "na1", label: "NA", routing: "americas" },
  { value: "kr", label: "KR", routing: "asia" },
  { value: "br1", label: "BR", routing: "americas" },
  { value: "la1", label: "LAN", routing: "americas" },
  { value: "la2", label: "LAS", routing: "americas" },
  { value: "oc1", label: "OCE", routing: "sea" },
  { value: "tr1", label: "TR", routing: "europe" },
  { value: "ru", label: "RU", routing: "europe" },
  { value: "jp1", label: "JP", routing: "asia" },
];

interface PlayerSuggestion {
  game_name: string;
  tag_line: string;
  profile_icon_id: number;
  summoner_level: number;
}

// Example reviews that float in the background
const floatingReviews = [
  {
    name: "Caps",
    tag: "EUW",
    rating: 5,
    icon: 5367,
    comment: "Best mid EU 🔥",
    position: "left" as const,
  },
  {
    name: "Faker",
    tag: "KR1",
    rating: 5,
    icon: 6,
    comment: "The GOAT",
    position: "right" as const,
  },
];

function FloatingReview({ review }: { review: (typeof floatingReviews)[0] }) {
  const isCaps = review.name === "Caps";

  return (
    <div
      className={`fixed hidden lg:flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-primary/10 opacity-50 hover:opacity-100 hover:bg-white/10 transition-all duration-300 cursor-default select-none hover:scale-105 animate-float ${
        isCaps
          ? "left-[22%] bottom-[25%] rotate-[-3deg]"
          : "right-[22%] top-[15%] rotate-[3deg]"
      }`}
      style={{
        animationDelay: isCaps ? "0s" : "3s",
      }}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${review.icon}.png`}
        alt=""
        className="w-10 h-10 rounded-full ring-2 ring-primary/30"
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {review.name}
          </span>
          <span className="text-muted-foreground text-xs">#{review.tag}</span>
        </div>
        <PoroRating value={review.rating} readonly size="sm" />
        <p className="text-xs text-muted-foreground">
          &quot;{review.comment}&quot;
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [riotId, setRiotId] = useState("");
  const [region, setRegion] = useState("euw1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Parse Riot ID into gameName and tagLine
  const parseRiotId = (id: string) => {
    const parts = id.split("#");
    return {
      gameName: parts[0] || "",
      tagLine: parts[1] || "",
    };
  };

  // Fetch suggestions when riotId changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      const { gameName } = parseRiotId(riotId);
      if (gameName.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/players/search?q=${encodeURIComponent(gameName)}`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounce);
  }, [riotId]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (player: PlayerSuggestion) => {
    setRiotId(`${player.game_name}#${player.tag_line}`);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { gameName, tagLine } = parseRiotId(riotId);

    if (!gameName.trim() || !tagLine.trim()) {
      setError("Please enter name#tag (e.g. Faker#KR1)");
      return;
    }

    setIsLoading(true);
    setError("");
    setShowSuggestions(false);

    try {
      const regionData = REGIONS.find((r) => r.value === region);
      const response = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(
          gameName
        )}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&routing=${
          regionData?.routing || "europe"
        }`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Player not found");
      }

      router.push(
        `/player/${encodeURIComponent(gameName)}-${encodeURIComponent(
          tagLine
        )}?region=${region}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <NavigationMenu />

      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-background" />

        {/* Static fallback for mobile/reduced motion (CSS handles visibility) */}
        <div className="absolute inset-0 bg-aurora-static md:hidden" />

        {/* SVG Aurora Effect - hidden on mobile via CSS */}
        <svg
          className="absolute inset-0 w-full h-full aurora-blur-heavy hidden md:block"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Blur filter - reduced stdDeviation for better performance */}
            <filter
              id="aurora-blur"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
            </filter>

            {/* Gradient definitions */}
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

        {/* Additional glow layer - hidden on mobile */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[80px] animate-pulse-slow aurora-blur-heavy hidden md:block" />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-radial-gradient" />
      </div>

      {/* Floating example reviews */}
      {floatingReviews.map((review) => (
        <FloatingReview key={review.name} review={review} />
      ))}

      <div className="w-full max-w-md space-y-10 relative z-10">
        {/* Logo/Title */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-primary">LoL</span>
              <span className="text-foreground/90">Review</span>
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-primary/60 to-purple-400/60 rounded-full mx-auto mt-3" />
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">
            Search for a player and leave your anonymous review
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-[3] relative group">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Name#TAG"
                value={riotId}
                onChange={(e) => {
                  setRiotId(e.target.value);
                  setSelectedIndex(-1);
                }}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className="h-14 px-4 bg-white/5 backdrop-blur-xl border border-white/10 focus-visible:border-primary/40 focus-visible:ring-0 text-base placeholder:text-muted-foreground/40 transition-all duration-200 hover:bg-white/[0.07] hover:border-white/15"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-card/95 backdrop-blur-xl rounded-lg overflow-hidden shadow-xl z-50 border border-white/5"
                >
                  {suggestions.map((player, index) => (
                    <button
                      key={`${player.game_name}-${player.tag_line}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(player)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        index === selectedIndex
                          ? "bg-primary/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${
                          player.profile_icon_id || 29
                        }.png`}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium text-foreground">
                        {player.game_name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        #{player.tag_line}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Region selector */}
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-24 !h-14 px-4 bg-white/5 backdrop-blur-xl border border-white/10 focus:ring-0 text-sm transition-all duration-200 hover:bg-white/[0.07] hover:border-white/15">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border border-white/10 min-w-[90px]">
                {REGIONS.map((r) => (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    className="focus:bg-primary/20 text-sm"
                  >
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search button */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/60 via-purple-500/60 to-primary/60 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
            <Button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-14 text-base font-semibold tracking-wide bg-primary/90 backdrop-blur-sm border border-white/10 hover:bg-primary transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </form>

        {/* Hint */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground/50 tracking-wide">
            e.g.{" "}
            <span className="text-muted-foreground/70 font-medium">Faker</span>
            <span className="text-primary/60">#</span>
            <span className="text-muted-foreground/70 font-medium">KR1</span>
          </p>
        </div>
      </div>
    </main>
  );
}
