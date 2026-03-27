"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GitBranch, KeyRound, Link2, Folder, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useProject from "@/hooks/use-project";

type FormInput = {
    repoUrl: string;
    projectName: string;
    githubToken?: string;
};

// Cinematic status messages shown during indexing
const INDEXING_STAGES = [
    "Preparing project workspace...",
    "Connecting to GitHub repository...",
    "Discovering codebase files...",
    "Reading source files...",
    "Gathering code chunks...",
    "Analysing file structures...",
    "Generating semantic summaries...",
    "Building vector embeddings...",
    "Mapping codebase knowledge graph...",
    "Indexing commits and history...",
    "Generating commit insights...",
    "Finalising project index...",
];

const IndexingLoader = ({ projectName }: { projectName: string }) => {
    const [stageIndex, setStageIndex] = useState(0);
    const [progress, setProgress] = useState(2);

    useEffect(() => {
        const stageInterval = setInterval(() => {
            setStageIndex((i) => (i < INDEXING_STAGES.length - 1 ? i + 1 : i));
        }, 4500);

        const progressInterval = setInterval(() => {
            setProgress((p) => {
                if (p < 92) return p + 1;
                return p;
            });
        }, 1400);

        return () => {
            clearInterval(stageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6 text-center">
      {/* Animated orb */}
      <div className="relative mb-12">
        <div className="absolute inset-0 rounded-full bg-indigo-200/60 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative size-20 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.2)]">
          <Image src="/icon.png" alt="logo" width={40} height={40} className="object-cover size-full rounded-full" />
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
        Processing <span className="text-indigo-600">{projectName}</span>
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-12 max-w-sm">
        We&apos;re indexing your entire codebase. This may take a few minutes depending on repo size.
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          <span className="animate-pulse text-indigo-600">{INDEXING_STAGES[stageIndex]}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex gap-2 mt-4">
        {INDEXING_STAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= stageIndex ? "bg-indigo-500 w-4" : "bg-slate-200 w-1"
            }`}
          />
        ))}
      </div>

      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-10">
        Do not close this window
      </p>
    </div>
  );
};

const CreatePage = () => {
    const { register, handleSubmit, reset, getValues } = useForm<FormInput>();
    const createProject = api.project.createProject.useMutation();
    const refetch = useRefetch();
    const router = useRouter();
    const { setProjectId } = useProject();

    // State for the indexing phase
    const [indexingProjectId, setIndexingProjectId] = useState<string | null>(null);
    const [indexingProjectName, setIndexingProjectName] = useState("");
    const [indexingGithubToken, setIndexingGithubToken] = useState<string | undefined>(undefined);

    // Poll the isIndexed flag
    const { data: statusData } = api.project.getProjectStatus.useQuery(
        { projectId: indexingProjectId! },
        {
            enabled: !!indexingProjectId,
            refetchInterval: (query) => {
                if (query.state.data?.isIndexed) return false;
                return 4000; // poll every 4 seconds
            },
        },
    );

    // Kick off the indexing API route (fire-and-forget, sets isIndexed when done)
    const startIndexing = async (projectId: string, githubToken?: string) => {
        try {
            await fetch("/api/index-project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, githubToken }),
            });
        } catch (err) {
            console.error("Indexing failed:", err);
            toast.error("Indexing encountered an error. You can retry from the dashboard.");
        }
    };

    // When indexing finishes, redirect to dashboard
    useEffect(() => {
        if (statusData?.isIndexed && indexingProjectId) {
            refetch();
            setProjectId(indexingProjectId);
            toast.success("Project ready! Redirecting to dashboard...");
            router.push("/dashboard");
        }
    }, [statusData?.isIndexed, indexingProjectId]);

    async function onSubmit(data: FormInput) {
        createProject.mutate(
            {
                githubUrl: data.repoUrl,
                name: data.projectName,
                githubToken: data.githubToken,
            },
            {
                onSuccess: async (project) => {
                    setIndexingProjectName(data.projectName);
                    setIndexingGithubToken(data.githubToken);
                    setIndexingProjectId(project.id);
                    reset();
                    // Fire off indexing in the background
                    void startIndexing(project.id, data.githubToken);
                },
                onError: () => {
                    toast.error("Failed to create project. Please try again.");
                },
            },
        );
        return true;
    }

    // Show the cinematic loader during indexing
    if (indexingProjectId && !statusData?.isIndexed) {
        return <IndexingLoader projectName={indexingProjectName} />;
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
                        Connect a repo and GitLexia will index your entire codebase,
                        analyse commits, and transcribe meetings automatically.
                    </p>
                </div>

                {/* Form card */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* Project Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-stone-600">Project Name</label>
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
                            <label className="text-xs font-medium text-stone-600">GitHub Repository URL</label>
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
                                <label className="text-xs font-medium text-stone-600">GitHub Token</label>
                                <span className="text-[10px] text-stone-400">Optional — for private repos</span>
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
                                {createProject.isPending ? "Creating…" : "Create & Index Project"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Footer hint */}
                <div className="mt-4 flex items-start gap-2 px-1">
                    <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-stone-400">
                        GitLexia will index your entire codebase and generate vector embeddings automatically right after creation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreatePage;
