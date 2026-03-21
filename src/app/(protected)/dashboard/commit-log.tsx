"use client";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Progress } from "@/components/ui/progress";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const utils = api.useUtils();
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const { data: commits, isLoading } = api.project.getCommits.useQuery(
    { projectId },
    {
      // Refetch every 3 seconds while insights are being generated
      refetchInterval: (query) => {
        const hasMissingSummary = query.state.data?.some((c) => !c.summary);
        return hasMissingSummary ? 3000 : false;
      },
    },
  );


  const generateInsights = api.project.generateInsights.useMutation({
    onSuccess: () => {
      utils.project.getCommits.invalidate({ projectId });
    },
  });


  const retryMutation = api.project.retryCommitSummary.useMutation({
    onSuccess: () => {
      utils.project.getCommits.invalidate({ projectId });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generateInsights.isPending || retryMutation.isPending) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((p) => {
          if (p < 33) {
            setStatus("Assessing the files...");
            return p + 1;
          }
          if (p < 66) {
            setStatus("Exploring all the docs...");
            return p + 1;
          }
          if (p < 99) {
            setStatus("Generating commit stream...");
            return p + 1;
          }
          return p;
        });
      }, 1500);
    } else {
      setProgress(0);
      setStatus("");
    }
    return () => clearInterval(interval);
  }, [generateInsights.isPending, retryMutation.isPending]);

  if (isLoading) {
    return (
      <ul className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <li key={i} className="relative flex gap-x-4">
            <div
              className={cn(
                i === 4 ? "h-6" : "-bottom-6",
                "absolute top-0 left-0 flex w-6 justify-center",
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200" />
            </div>
            <div className="relative mt-4 size-8 flex-none animate-pulse rounded-full bg-stone-200" />
            <div className="flex-auto rounded-md bg-white p-3 px-5 ring-1 ring-gray-200 ring-inset">
              <div className="flex flex-col gap-3">
                <div className="h-3.5 w-32 animate-pulse rounded bg-stone-200" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-stone-200" />
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-stone-100" />
                  <div className="h-3 w-4/6 animate-pulse rounded bg-stone-100" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      {(generateInsights.isPending || retryMutation.isPending) && (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="animate-pulse font-semibold text-blue-700">
              {status}
            </span>
            <span className="font-medium text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-blue-100" />
        </div>
      )}

      {commits?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-dashed rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4 text-center">
            Your project has been created, but insights haven't been generated yet.
          </p>
          <button
            onClick={() => generateInsights.mutate({ projectId })}
            disabled={generateInsights.isPending}
            className="rounded-full bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {generateInsights.isPending ? "Generating..." : "Generate Summary Insights"}
          </button>
        </div>
      ) : (
        <ul className="space-y-6">
          {commits?.map((commit, commitIdx) => (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                  "absolute top-0 left-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg-gray-200"></div>
              </div>

              <>
                <img
                  src={commit.commitAuthorAvatar}
                  alt="commit avatar"
                  className="relative mt-4 size-8 flex-none rounded-full bg-gray-100"
                />
                <div className="rounded-mg flex-auto bg-white p-3 px-5 ring-1 ring-gray-200 ring-inset">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      className="text-sx py-0.5 leading-5 text-gray-500"
                    >
                      <span className="font-semibold text-gray-900">
                        {commit.commitAuthorName}
                      </span>{" "}
                      <span className="ml-1 inline-flex items-center">
                        commited
                        <ExternalLink className="ml-2 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="text-lg font-extrabold text-blue-600">
                    {commit.commitMessage}
                  </span>
                  {commit.summary ? (
                    <div className="mt-2" data-color-mode="light">
                      <MDEditor.Markdown
                        source={commit.summary}
                        className="!bg-transparent !text-sm !font-mono text-md! !leading-6 !text-gray-600"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                      <div className="h-3 w-5/6 animate-pulse rounded bg-stone-100" />
                      <div className="h-3 w-4/6 animate-pulse rounded bg-stone-100" />
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-[11px] text-stone-400">
                          {retryMutation.isPending ? "Retrying..." : "Summary not generated yet"}
                        </p>
                        <button
                          onClick={() => retryMutation.mutate({ commitId: commit.id })}
                          disabled={retryMutation.isPending}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                          {retryMutation.isPending ? "Regenerating..." : "Retry manually"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default CommitLog;
