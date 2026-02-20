"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GitBranch, KeyRound, Link2, Folder } from "lucide-react";

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
    <div className="-ml-8 flex h-full items-center justify-center 2xl:gap-16">
      {/* Illustration */}
      <div className="hidden lg:block">
        <Image
          src="/colab.svg"
          alt="illustration"
          width={180}
          height={180}
          className="size-130 opacity-90 2xl:size-180"
        />
      </div>

      {/* Form panel */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-stone-900">
            <GitBranch className="size-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800">
            Link your GitHub Repository
          </h1>
          <p className="mt-1.5 text-sm text-stone-400">
            Connect a repo and GitLexia will index your codebase, analyse
            commits, and transcribe meetings automatically.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Project Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-600">
                Project Name
              </label>
              <div className="relative">
                <Folder className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
                <Input
                  {...register("projectName", { required: true })}
                  placeholder="my-awesome-project"
                  className="pl-9"
                />
              </div>
            </div>

            {/* GitHub URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-stone-600">
                GitHub Repository URL
              </label>
              <div className="relative">
                <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
                <Input
                  {...register("repoUrl", { required: true })}
                  placeholder="https://github.com/user/repo"
                  className="pl-9"
                />
              </div>
            </div>

            {/* GitHub Token */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-600">
                  GitHub Token
                </label>
                <span className="text-[10px] text-stone-400">
                  Optional — for private repos
                </span>
              </div>
              <div className="relative">
                <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
                <Input
                  {...register("githubToken")}
                  placeholder="ghp_xxxxxxxxxxxx"
                  type="password"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="mt-1">
              <Button
                type="submit"
                disabled={createProject.isPending}
                className="w-full rounded-full!"
              >
                {createProject.isPending ? "Creating…" : "Create Project"}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-center text-[11px] text-stone-400">
          GitLexia will index your repository in the background. This may take a
          few minutes depending on the size of the codebase.
        </p>
      </div>
    </div>
  );
};

export default CreatePage;
