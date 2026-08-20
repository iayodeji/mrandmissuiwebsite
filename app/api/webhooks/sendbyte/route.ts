import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function GET() {
  return NextResponse.json({ status: "SendByte Webhook Endpoint Active" }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const signatureHeader =
      request.headers.get("x-sendbyte-signature") ||
      request.headers.get("sendbyte-signature");
    const secret = process.env.SENDBYTE_WEBHOOK_SECRET;

    if (!secret) {
      console.error("SENDBYTE_WEBHOOK_SECRET is missing!");
      return NextResponse.json({ error: "Missing secret" }, { status: 200 });
    }

    if (!signatureHeader) {
      console.warn("Missing signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 200 });
    }

    // 1. Parse the header: "t=1787251292,v1=fa93a28..."
    const signatureParts = signatureHeader.split(",").reduce((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const timestamp = signatureParts["t"];
    const actualSignature = signatureParts["v1"];

    if (!timestamp || !actualSignature) {
      console.error("Malformed signature header:", signatureHeader);
      return NextResponse.json({ error: "Invalid signature format" }, { status: 200 });
    }

    // 2. Prevent Replay Attacks (Optional but recommended)
    // Check if the webhook is older than 5 minutes (300 seconds)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp - parseInt(timestamp, 10) > 300) {
      console.error("Webhook timestamp is too old (expired)");
      return NextResponse.json({ error: "Expired signature" }, { status: 200 });
    }

    // 3. Compute HMAC over `${timestamp}.${bodyText}`
    const payloadToSign = `${timestamp}.${bodyText}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadToSign)
      .digest("hex");

    // 4. Securely compare the expected signature with the actual v1 signature
    if (actualSignature !== expectedSignature) {
      console.error("SendByte signature mismatch!", {
        received: actualSignature,
        expected: expectedSignature,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
    }

    // --- SIGNATURE IS VALID past this point ---

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
      } else {
        console.log(`Successfully recorded delivery for voter: ${voterId}`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("SendByte Webhook Error:", error);
    return NextResponse.json({ error: "Internal handler error" }, { status: 200 });
  }
}