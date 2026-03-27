import { db } from "@/server/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("x-razorpay-signature") ?? "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const isValid = verifyWebhookSignature(body, signature, webhookSecret);

  if (!isValid) {
    console.error("Invalid Razorpay webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log(`[Razorpay Webhook] Received event: ${event.event}`);

  // Handle order.paid or payment.captured
  if (event.event === "order.paid") {
    const order = event.payload.order.entity;
    const payment = event.payload.payment.entity;

    const credits = Number(order.notes.credits);
    const userId = order.notes.userId;
    const razorpayOrderId = order.id;
    const razorpayPaymentId = payment.id;
    const razorpaySignature = signature; // Store the webhook signature

    if (!userId || isNaN(credits)) {
      console.error("[Razorpay Webhook] Missing userId or credits in order notes");
      return NextResponse.json({ error: "Invalid order notes" }, { status: 400 });
    }

    try {
      // Check if transaction already exists
      const alreadyProcessed = await db.transaction.findFirst({
        where: { razorpayPaymentId },
      });

      if (alreadyProcessed) {
        console.warn(`[Razorpay Webhook] Payment ${razorpayPaymentId} already processed`);
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      // Record transaction and credit user
      console.log(`[Razorpay Webhook] Crediting user ${userId} with ${credits} credits for order ${razorpayOrderId}`);
      await db.$transaction([
        db.transaction.create({
          data: {
            userId,
            credits,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
          },
        }),
        db.user.update({
          where: { id: userId },
          data: { credits: { increment: credits } },
        }),
      ]);
      console.log(`[Razorpay Webhook] Success!`);
    } catch (error) {
      console.error(`[Razorpay Webhook] Error processing payment:`, error);
      return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
