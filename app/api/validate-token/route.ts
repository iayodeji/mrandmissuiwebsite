/**
 * GET /api/validate-token
 *
 * Security hardening applied:
 * - All `as unknown as` type assertions removed — the typed Supabase client
 *   infers correct types from the Database generic.
 * - Error responses never leak internal details.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const { data: voter, error } = await supabase
      .from("voters")
      .select("*")
      .eq("vote_token", token)
      .single();

    if (error || !voter) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Already voted
    if (voter.has_voted) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Token expired
    if (voter.token_expires_at && new Date(voter.token_expires_at) < new Date()) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Error in validate-token:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
