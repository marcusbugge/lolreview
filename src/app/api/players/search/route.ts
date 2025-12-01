import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .select("game_name, tag_line, display_name, display_tag, profile_icon_id, summoner_level")
      .ilike("game_name", `${query}%`)
      .order("search_count", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error searching players:", error);
      return NextResponse.json([]);
    }

    // Return display names for showing, but keep game_name/tag_line for lookups
    const formattedData = (data || []).map(player => ({
      game_name: player.display_name || player.game_name,
      tag_line: player.display_tag || player.tag_line,
      profile_icon_id: player.profile_icon_id,
      summoner_level: player.summoner_level,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json([]);
  }
}

