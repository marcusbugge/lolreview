import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { summoner_name, region, rating, comment } = body;

    if (!summoner_name || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);

    // Check if this IP has already reviewed this player
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("summoner_name", summoner_name)
      .eq("reviewer_ip", clientIP)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this player" },
        { status: 429 }
      );
    }

    // Insert the new review
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          summoner_name,
          region: region || "unknown",
          rating,
          comment: comment?.trim() || null,
          reviewer_ip: clientIP,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting review:", error);
      return NextResponse.json(
        { error: "Could not save review" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

