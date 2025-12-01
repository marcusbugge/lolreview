import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json([]);
  }

  try {
    // Select specific columns for trending players
    const { data, error } = await supabase
      .from("players")
      .select("id, game_name, tag_line, display_name, display_tag, profile_icon_id, summoner_level, region, search_count")
      .order("search_count", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching trending players:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json([]);
  }
}

