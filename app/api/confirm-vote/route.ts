import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
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

    // Perform atomic confirm-vote transaction
    const voteSessionId = uuidv4();
    try {
      await (
        supabase.rpc as unknown as (
          func: string,
          args: Record<string, unknown>
        ) => Promise<unknown>
      )("confirm_vote_atomic", {
        p_token: token,
        p_mr_candidate_id: mrCandidateId,
        p_miss_candidate_id: missCandidateId,
        p_vote_session_id: voteSessionId,
      });

      return NextResponse.json(
        { message: "Vote recorded successfully!" },
        { status: 200 }
      );
    } catch (rpcError) {
      console.error("Transaction error:", rpcError);
      // Generic error message to avoid leaking reason
      return NextResponse.json(
        { error: "This link is invalid or has already been used." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in confirm-vote:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
