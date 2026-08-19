/**
 * GET /api/leaderboard
 *
 * Counts are computed in Postgres via get_leaderboard_counts() RPC —
 * avoids PostgREST's 1000-row default limit entirely since we never
 * fetch raw vote rows, only the aggregated result.
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase.rpc("get_leaderboard_counts");

    if (error) {
      console.error("Leaderboard RPC error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.candidate_id] = Number(row.vote_count);
    }

    return NextResponse.json({ counts });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}