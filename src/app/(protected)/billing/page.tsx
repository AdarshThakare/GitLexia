"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { redirect } from "next/navigation";
import useProject from "@/hooks/use-project";
import { Zap, GitCommit, Mic, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const CREDIT_PACKS = [
  { credits: 50, price: 10, label: "₹10.00" },
  { credits: 150, price: 15, label: "₹15.00" },
  { credits: 500, price: 50, label: "₹50.00" },
];

const BillingPage = () => {
  const { project } = useProject();
  if (!project) redirect("/create");

  const { refetch: refetchCredits } = api.project.getMyCredits.useQuery();
  const createOrder = api.project.createOrder.useMutation();
  const verifyPayment = api.project.verifyPayment.useMutation();
  const [loading, setLoading] = useState<number | null>(null);

  const handleBuy = async (
    pack: (typeof CREDIT_PACKS)[number],
    index: number,
  ) => {
    setLoading(index);
    try {
      // Step 1 — create Razorpay order server-side
      const order = await createOrder.mutateAsync({
        credits: pack.credits,
        amount: pack.price,
      });

      // Step 2 — open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: pack.price * 100, // paise
        currency: "INR",
        name: "GitLexia",
        description: `${pack.credits} Credits`,
        order_id: order.razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3 — verify signature + credit user
          await verifyPayment.mutateAsync({
            credits: pack.credits,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success(`${pack.credits} credits added to your account!`);
          void refetchCredits();
        },
        theme: { color: "#0c0a09" },
      };

      // @ts-expect-error – Razorpay loaded via script tag in layout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const credits = 0;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <div className="mb-6 border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-800">
          Billing
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Buy credits to use commit insights and meeting summaries
        </p>
      </div>

      {/* Balance card */}
      <Card className="border-border/40 bg-background hover:border-primary/40 relative mb-6 transition-shadow duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Your Credits</CardTitle>
          <h5 className="-mt-2 mb-3 text-sm tracking-wide text-gray-400">
            Credits are consumed when you generate insights or summaries
          </h5>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-stone-100">
              <Zap className="size-5 text-stone-600" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-stone-900">
                {credits}
              </p>
              <p className="text-xs text-stone-400">credits remaining</p>
            </div>
          </div>

          {/* Credit cost reference */}
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3">
              <GitCommit className="mt-0.5 size-4 shrink-0 text-stone-500" />
              <div>
                <p className="text-sm font-medium text-stone-700">
                  1 credit per file — Commit Insights
                </p>
                <p className="text-xs text-stone-400">
                  Each file referenced in RAG analysis costs 1 credit. A commit
                  touching 50 files uses 50 credits.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3">
              <Mic className="mt-0.5 size-4 shrink-0 text-stone-500" />
              <div>
                <p className="text-sm font-medium text-stone-700">
                  5 credits per recording — Meeting Summaries
                </p>
                <p className="text-xs text-stone-400">
                  Each audio file you upload costs 5 credits regardless of
                  length.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit packs */}
      <h2 className="mb-3 text-base font-semibold text-stone-700">
        Buy Credits
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CREDIT_PACKS.map((pack, i) => (
          <div
            key={pack.credits}
            className="group flex flex-col gap-4 rounded-xl border border-stone-100 bg-white px-5 py-5 shadow-sm transition-all duration-200 hover:border-stone-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-stone-100 transition-colors group-hover:bg-stone-200">
                <Zap className="size-4 text-stone-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-stone-900">{pack.label}</p>
                <p className="text-sm font-semibold text-stone-700">
                  {pack.credits} Credits
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-stone-400">
              <span>≈ Up to {pack.credits} RAG files indexed</span>
              <span>≈ {Math.floor(pack.credits / 5)} meeting summaries</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="mt-auto w-full rounded-full!"
              disabled={loading === i}
              onClick={() => handleBuy(pack, i)}
            >
              {loading === i ? "Opening…" : "Buy"}
            </Button>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-stone-700">
          Transaction History
        </h2>
        <TransactionHistory />
      </div>
    </div>
  );
};

const TransactionHistory = () => {
  const { data: transactions, isLoading } =
    api.project.getTransactions.useQuery();

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-xl border border-stone-100 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 animate-pulse rounded-full bg-stone-100" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-32 animate-pulse rounded-md bg-stone-100" />
                <div className="h-3 w-20 animate-pulse rounded-md bg-stone-100" />
              </div>
            </div>
            <div className="h-4 w-16 animate-pulse rounded-md bg-stone-100" />
          </li>
        ))}
      </ul>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
        <div className="bg-muted flex items-center justify-center rounded-full p-4">
          <TrendingUp className="text-muted-foreground/60 size-6" />
        </div>
        <p className="text-sm font-medium text-gray-700">No transactions yet</p>
        <p className="text-xs text-gray-400">
          Your credit purchases will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {transactions.map((tx) => (
        <li
          key={tx.id}
          className="flex items-center justify-between rounded-xl border border-stone-100 bg-white px-5 py-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
              <Zap className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">
                {tx.credits} credits purchased
              </p>
              <p className="text-xs text-stone-400">
                {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-emerald-600">
            +{tx.credits} cr
          </span>
        </li>
      ))}
    </ul>
  );
};

export default BillingPage;
