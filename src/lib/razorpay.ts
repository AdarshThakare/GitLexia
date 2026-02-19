import Razorpay from "razorpay";
import crypto from "crypto";
import { db } from "@/server/db";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_ID!,
  key_secret: process.env.RAZORPAY_API_SECRET!,
});

/**
 * Creates a Razorpay order for the given amount (in INR).
 * Call this before opening the Razorpay checkout on the client.
 */
export async function createRazorpayOrder(amount: number, credits: number) {
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    notes: {
      credits: String(credits),
    },
  });

  return {
    razorpayOrderId: order.id,
    amount: order.amount,
    currency: order.currency,
  };
}

/**
 * Verifies the Razorpay payment signature and — if valid — records
 * the transaction and credits the user in one DB transaction.
 *
 * Throws if the signature is invalid or the payment has already been recorded.
 */
export async function verifyAndCreditUser({
  userId,
  credits,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  userId: string;
  credits: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  // 1. Verify HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Invalid payment signature");
  }

  // 2. Guard against duplicate payment processing
  const alreadyProcessed = await db.transaction.findFirst({
    where: { razorpayPaymentId },
  });

  if (alreadyProcessed) {
    throw new Error("Payment already processed");
  }

  // 3. Record transaction + credit user atomically
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
    // db.user.update({
    //   where: { id: userId },
    //   data: { credits: { increment: credits } },
    // }),
  ]);
}
