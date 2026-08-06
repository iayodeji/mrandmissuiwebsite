import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface Candidate {
  id: string;
  name: string;
  category: "mr" | "miss";
  is_active: boolean;
  photo_url: string | null;
}

export async function GET() {
  try {
    const { data: candidates, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("name");

    if (error) throw error;

    const typedCandidates = (candidates || []) as Candidate[];
    const mrCandidates = typedCandidates.filter((c) => c.category === "mr");
    const missCandidates = typedCandidates.filter((c) => c.category === "miss");

    return NextResponse.json({
      mr: mrCandidates,
      miss: missCandidates,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
