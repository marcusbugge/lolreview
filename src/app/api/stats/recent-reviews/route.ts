import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json([]);
  }

  try {
    // Only select safe columns - exclude reviewer_ip
    const { data, error } = await supabase
      .from("reviews")
      .select("id, summoner_name, region, rating, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching recent reviews:", error);
      return NextResponse.json([]);
    }

    // Enrich reviews with display names from players table
    if (data && data.length > 0) {
      // Get unique summoner names (lowercase format: "name#tag")
      const summonerNames = [...new Set(data.map(r => r.summoner_name))];
      
      // Fetch display names from players table
      const displayNameMap = new Map<string, { display_name: string; display_tag: string }>();
      
      for (const summonerName of summonerNames) {
        const [gameName, tagLine] = summonerName.split("#");
        if (gameName && tagLine) {
          const { data: player } = await supabase
            .from("players")
            .select("display_name, display_tag")
            .eq("game_name", gameName.toLowerCase())
            .eq("tag_line", tagLine.toLowerCase())
            .single();
          
          if (player?.display_name && player?.display_tag) {
            displayNameMap.set(summonerName, {
              display_name: player.display_name,
              display_tag: player.display_tag,
            });
          }
        }
      }
      
      // Add display_summoner_name to each review
      const enrichedData = data.map(review => {
        const displayInfo = displayNameMap.get(review.summoner_name);
        return {
          ...review,
          display_summoner_name: displayInfo 
            ? `${displayInfo.display_name}#${displayInfo.display_tag}`
            : review.summoner_name,
        };
      });
      
      return NextResponse.json(enrichedData);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json([]);
  }
}

