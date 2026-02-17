"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const createProject = api.project.createProject.useMutation();

  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully.");
          refetch();
          reset();
        },
        onError: () => {
          toast.error("Failed to create a project");
        },
      },
    );
    return true;
  }

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src="/bro.svg"
        alt="illustration"
        width={100}
        height={100}
        className="size-100 2xl:size-140"
      />
      <div className="">
        <div className="">
          <h1 className="text-2xl font-semibold">
            Link your GitHub Repository
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of your repository to link it to GitLexia
          </p>
        </div>
        <div className="h-4"></div>
        <div className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
            />
            <div className="h-3.5"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="GitHub URL"
            />
            <div className="h-3.5"></div>
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (Optional)"
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
