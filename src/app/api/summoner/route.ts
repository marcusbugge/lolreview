import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Save player to database for autocomplete and tracking
async function savePlayer(player: {
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  region: string;
}) {
  try {
    // Normalize to lowercase for consistent storage
    const normalizedGameName = player.gameName.toLowerCase();
    const normalizedTagLine = player.tagLine.toLowerCase();
    
    // First check if player exists
    const { data: existing } = await supabase
      .from("players")
      .select("search_count")
      .eq("game_name", normalizedGameName)
      .eq("tag_line", normalizedTagLine)
      .single();

    if (existing) {
      // Player exists, increment search count
      await supabase
        .from("players")
        .update({
          search_count: (existing.search_count || 0) + 1,
          last_searched: new Date().toISOString(),
          profile_icon_id: player.profileIconId,
          summoner_level: player.summonerLevel,
          region: player.region,
          // Store the display name (original casing from Riot API)
          display_name: player.gameName,
          display_tag: player.tagLine,
        })
        .eq("game_name", normalizedGameName)
        .eq("tag_line", normalizedTagLine);
    } else {
      // New player, insert with search_count = 1
      await supabase
        .from("players")
        .insert({
          game_name: normalizedGameName,
          tag_line: normalizedTagLine,
          display_name: player.gameName,
          display_tag: player.tagLine,
          profile_icon_id: player.profileIconId,
          summoner_level: player.summonerLevel,
          region: player.region,
          search_count: 1,
          last_searched: new Date().toISOString(),
        });
    }
  } catch (e) {
    console.log("Could not save player:", e);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get("gameName");
  const tagLine = searchParams.get("tagLine");
  const region = searchParams.get("region") || "euw1";
  const routing = searchParams.get("routing") || "europe";

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "gameName and tagLine are required" },
      { status: 400 }
    );
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json(
      { error: "Riot API key is missing" },
      { status: 500 }
    );
  }

  try {
    // Get account by Riot ID using the routing value
    const accountResponse = await fetch(
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        return NextResponse.json(
          { error: "Player not found" },
          { status: 404 }
        );
      }
      throw new Error("Riot API error");
    }

    const account = await accountResponse.json();

    // Get summoner data using PUUID and the specific region
    const summonerResponse = await fetch(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    if (!summonerResponse.ok) {
      // Return basic info if summoner data not found in the specific region
      const playerData = {
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
        profileIconId: 29,
        summonerLevel: 0,
        region: region,
      };
      
      await savePlayer(playerData);
      return NextResponse.json(playerData);
    }

    const summoner = await summonerResponse.json();

    // Get ranked data using PUUID
    let rankedData = null;
    try {
      const rankedUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${account.puuid}`;
      console.log("Fetching ranked from:", rankedUrl);
      
      const rankedResponse = await fetch(rankedUrl, {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      });

      console.log("Ranked status:", rankedResponse.status);

      if (rankedResponse.ok) {
        const rankedEntries = await rankedResponse.json();
        console.log("Ranked entries:", JSON.stringify(rankedEntries));
        
        // Find Solo/Duo queue
        const soloQueue = rankedEntries.find(
          (entry: { queueType: string }) => entry.queueType === "RANKED_SOLO_5x5"
        );
        if (soloQueue) {
          rankedData = {
            tier: soloQueue.tier,
            rank: soloQueue.rank,
            lp: soloQueue.leaguePoints,
            wins: soloQueue.wins,
            losses: soloQueue.losses,
          };
        }
      } else {
        const errorText = await rankedResponse.text();
        console.log("Ranked error:", errorText);
      }
    } catch (e) {
      console.log("Could not fetch ranked data:", e);
    }

    const playerData = {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      profileIconId: summoner.profileIconId,
      summonerLevel: summoner.summonerLevel,
      region: region,
      ranked: rankedData,
    };
    
    // Save to database for autocomplete
    await savePlayer(playerData);

    return NextResponse.json(playerData);
  } catch (error) {
    console.error("Error fetching summoner:", error);
    return NextResponse.json(
      { error: "Could not fetch player data" },
      { status: 500 }
    );
  }
}
