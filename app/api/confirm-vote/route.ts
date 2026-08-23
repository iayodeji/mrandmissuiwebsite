/**
 * POST /api/confirm-vote
 *
 * Security hardening applied:
 * - All `as unknown as` type assertions removed — the typed Supabase client
 *   handles `rpc()` correctly via the Database generic.
 * - Error responses never expose internal details; everything is logged
 *   server-side.
 * - `confirm_vote_atomic` is already transaction-safe in the database; the
 *   RPC call wraps the transaction boundary.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string;
      mrCandidateId?: string;
      missCandidateId?: string;
    };
    const { token, mrCandidateId, missCandidateId } = body;

    if (!token || !mrCandidateId || !missCandidateId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that both candidate IDs belong to active candidates with correct categories
    const { data: mrCandidate, error: mrError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", mrCandidateId)
      .eq("category", "mr")
      .eq("is_active", true)
      .single();

    if (mrError || !mrCandidate) {
      return NextResponse.json(
        { error: "Invalid Mr candidate selection" },
        { status: 400 }
      );
    }

    const { data: missCandidate, error: missError } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", missCandidateId)
      .eq("category", "miss")
      .eq("is_active", true)
      .single();

    if (missError || !missCandidate) {
      return NextResponse.json(
        { error: "Invalid Miss candidate selection" },
        { status: 400 }
      );
    }

    // Perform atomic confirm-vote transaction via the database RPC function
    const voteSessionId = uuidv4();

    try {
      const { error: rpcError } = await supabase.rpc("confirm_vote_atomic", {
        p_token: token,
        p_mr_candidate_id: mrCandidateId,
        p_miss_candidate_id: missCandidateId,
        p_vote_session_id: voteSessionId,
      });

      if (rpcError) {
        // RPC raised an exception (token invalid / expired / already used)
        console.error("confirm_vote_atomic RPC error:", rpcError.message);
        return NextResponse.json(
          { error: "This link is invalid or has already been used." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "Vote recorded successfully!" },
        { status: 200 }
      );
    } catch (rpcError) {
      console.error("Transaction error:", rpcError);
      return NextResponse.json(
        { error: "This link is invalid or has already been used." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in confirm-vote:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
