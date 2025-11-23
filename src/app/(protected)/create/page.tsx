"use client";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src="/bro.svg"
        alt="illustration"
        width={100}
        height={100}
        className="size-80"
      />
      <div className="">
        <div className="">
          <h1 className="text-2xl font-semibold">
            Link your GitHub Repository
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of your repository to link it to GitOSphere
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
