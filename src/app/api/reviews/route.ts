import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Constants for validation
const MAX_COMMENT_LENGTH = 500;
const MIN_RATING = 1;
const MAX_RATING = 5;

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

// Sanitize comment - remove potentially harmful content
function sanitizeComment(comment: string | null): string | null {
  if (!comment) return null;
  
  // Trim and limit length
  let sanitized = comment.trim().slice(0, MAX_COMMENT_LENGTH);
  
  // Remove potential HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  return sanitized || null;
}

// Normalize summoner name to lowercase for consistent lookups
function normalizeSummonerName(name: string): string {
  return name.toLowerCase();
}

// GET - Fetch reviews for a player (without exposing IP addresses)
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json([]);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const summonerName = searchParams.get("summoner_name");

    if (!summonerName) {
      return NextResponse.json(
        { error: "summoner_name is required" },
        { status: 400 }
      );
    }

    // Normalize to lowercase for case-insensitive lookup
    const normalizedName = normalizeSummonerName(summonerName);

    // Only select safe columns - explicitly exclude reviewer_ip
    const { data, error } = await supabase
      .from("reviews")
      .select("id, summoner_name, region, rating, comment, created_at")
      .eq("summoner_name", normalizedName)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json([]);
  }
}

// POST - Create a new review
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

    // Validate required fields
    if (!summoner_name || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate summoner_name format and length
    if (typeof summoner_name !== 'string' || summoner_name.length > 50) {
      return NextResponse.json(
        { error: "Invalid summoner name" },
        { status: 400 }
      );
    }

    // Validate rating is a number within range
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < MIN_RATING || numRating > MAX_RATING || !Number.isInteger(numRating)) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Sanitize comment
    const sanitizedComment = sanitizeComment(comment);
    
    // Normalize summoner name to lowercase for consistent storage
    const normalizedSummonerName = normalizeSummonerName(summoner_name);

    const clientIP = getClientIP(request);

    // Check if this IP has already reviewed this player (case-insensitive)
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("summoner_name", normalizedSummonerName)
      .eq("reviewer_ip", clientIP)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this player" },
        { status: 429 }
      );
    }

    // Insert the new review with normalized summoner name
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          summoner_name: normalizedSummonerName,
          region: region || "unknown",
          rating: numRating,
          comment: sanitizedComment,
          reviewer_ip: clientIP,
        },
      ])
      .select("id, summoner_name, region, rating, comment, created_at")
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

