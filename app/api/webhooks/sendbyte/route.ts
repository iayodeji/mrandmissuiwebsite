import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

// 1. Health check handler for SendByte ping/verification checks
export async function GET() {
  return NextResponse.json({ status: "SendByte Webhook Endpoint Active" }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const signature =
      request.headers.get("x-sendbyte-signature") ||
      request.headers.get("sendbyte-signature");
    const secret = process.env.SENDBYTE_WEBHOOK_SECRET;

    // Log diagnostic info to Vercel/server logs
    console.log("SendByte Webhook Event Received:", {
      hasSignature: !!signature,
      hasSecret: !!secret,
    });

    if (!secret) {
      console.error("SENDBYTE_WEBHOOK_SECRET is missing from environment variables!");
      // Return 200 during debugging so SendByte doesn't disable the endpoint
      return NextResponse.json({ error: "Missing secret configuration" }, { status: 200 });
    }

    if (!signature) {
      console.warn("Missing signature header from SendByte request");
      return NextResponse.json({ error: "Missing signature header" }, { status: 200 });
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("SendByte signature mismatch!", {
        received: signature,
        expected: expectedSignature,
      });
      // Return 200 while tuning signature checks to prevent lockouts
      return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
    }

    const payload = JSON.parse(bodyText);
    const eventType = payload.event || payload.type;
    const voterId = payload.metadata?.voter_id || payload.data?.metadata?.voter_id;

    if (voterId && (eventType === "delivered" || eventType === "email.delivered")) {
      const { error } = await supabase
        .from("voters")
        .update({ link_sent_at: new Date().toISOString() })
        .eq("id", voterId);

      if (error) {
        console.error("Failed to update link_sent_at in DB:", error);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("SendByte Webhook Error:", error);
    // Always return 200 so SendByte considers the HTTP delivery completed
    return NextResponse.json({ error: "Internal handler error" }, { status: 200 });
  }
}