import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-sendbyte-signature");
    const secret = process.env.SENDBYTE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    // Verify the webhook is actually from SendByte
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    
    // Extract the event type and our custom metadata
    const eventType = payload.event || payload.type;
    const voterId = payload.metadata?.voter_id;

    if (!voterId) {
      return NextResponse.json({ message: "Ignored: No metadata" }, { status: 200 });
    }

    // Only stamp the time if the email was successfully delivered
    if (eventType === "delivered" || eventType === "email.delivered") {
      const { error } = await supabase
        .from("voters")
        .update({ link_sent_at: new Date().toISOString() })
        .eq("id", voterId);

      if (error) {
        console.error("DB update failed:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    } 
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Sendbyte webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}