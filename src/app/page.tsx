"use client";

import React from "react";
import GitLexiaLanding from "@/components/landing-view";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  return (
    <GitLexiaLanding 
      onExplore={() => {
        router.push("/dashboard");
      }} 
    />
  );
};

export default Page;
