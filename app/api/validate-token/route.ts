import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface VoterRecord {
  id: string;
  email: string;
  has_voted: boolean;
  vote_token: string | null;
  token_expires_at: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const { data: voter, error } = await (
      supabase.from("voters") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: unknown) => {
            single: () => Promise<{ data: unknown; error: unknown }>;
          };
        };
      }
    )
      .select("*")
      .eq("vote_token", token)
      .single();

    const typedVoter = voter as VoterRecord | null;

    if (error || !typedVoter) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Check if already voted
    if (typedVoter.has_voted) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Check if token expired
    if (typedVoter.token_expires_at && new Date(typedVoter.token_expires_at) < new Date()) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Error in validate-token:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
