import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/react";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import Script from "next/script";

const sup = localFont({ src: "../fonts/sup/sup.woff2" });

export const metadata: Metadata = {
  title: "GitLexia",
  description: "An helper app for quick Github lookup",
  icons: [{ rel: "icon", url: "/iconic.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${sup.className}`} suppressHydrationWarning>
        <body suppressHydrationWarning>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster richColors />
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </body>
      </html>
    </ClerkProvider>
  );
}
