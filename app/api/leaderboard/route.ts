/**
 * GET /api/leaderboard
 *
 * Security hardening applied:
 * - Type assertion `(voteRows || []) as { candidate_id: string }[]` removed;
 *   the typed Supabase client already infers the row shape.
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data: voteRows, error } = await supabase
      .from("votes")
      .select("candidate_id");

    if (error) throw error;

    const counts = new Map<string, number>();
    for (const row of voteRows ?? []) {
      counts.set(row.candidate_id, (counts.get(row.candidate_id) ?? 0) + 1);
    }

    return NextResponse.json({
      counts: Object.fromEntries(counts),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
