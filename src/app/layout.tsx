import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/react";
import localFont from "next/font/local";
import { Toaster } from "sonner";

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
      <html lang="en" className={`${sup.className}`}>
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
