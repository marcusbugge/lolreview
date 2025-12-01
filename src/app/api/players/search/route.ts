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
      .select("game_name, tag_line, profile_icon_id, summoner_level")
      .ilike("game_name", `${query}%`)
      .order("search_count", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error searching players:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json([]);
  }
}

