"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavigationMenu } from "@/components/navigation-menu";
import { TrendingUp, Search, Loader2 } from "lucide-react";

interface Player {
  id: string;
  game_name: string;
  tag_line: string;
  profile_icon_id: number;
  summoner_level: number;
  region: string;
  search_count: number;
  last_searched: string;
}

export default function TrendingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/stats/trending");
        const data = await res.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching trending:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handlePlayerClick = (player: Player) => {
    router.push(`/player/${encodeURIComponent(player.game_name)}-${encodeURIComponent(player.tag_line)}?region=${player.region}`);
  };

  return (
    <main className="min-h-screen">
      <NavigationMenu />
      
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="aurora-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
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
          <g filter="url(#aurora-blur)">
            <ellipse cx="20%" cy="30%" rx="40%" ry="25%" fill="url(#aurora-gradient-1)" className="animate-aurora-1" />
            <ellipse cx="80%" cy="60%" rx="35%" ry="30%" fill="url(#aurora-gradient-2)" className="animate-aurora-2" />
            <ellipse cx="50%" cy="80%" rx="50%" ry="20%" fill="url(#aurora-gradient-3)" className="animate-aurora-3" />
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
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Most Searched</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Players with the highest search counts
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && players.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No players found yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Search for players to see them here
            </p>
          </div>
        )}

        {/* Player list */}
        {!isLoading && players.length > 0 && (
          <div className="space-y-2">
            {players.map((player, index) => (
              <button
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200 group"
              >
                {/* Rank */}
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${player.profile_icon_id || 29}.png`}
                  alt=""
                  className="w-12 h-12 rounded-full ring-2 ring-white/10 group-hover:ring-primary/30 transition-all"
                />

                {/* Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {player.game_name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      #{player.tag_line}
                    </span>
                    <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded">
                      {player.region.toUpperCase().replace("1", "")}
                    </span>
                  </div>
                  {player.summoner_level > 0 && (
                    <span className="text-xs text-muted-foreground/60">
                      Level {player.summoner_level}
                    </span>
                  )}
                </div>

                {/* Search count */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium">{player.search_count}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

