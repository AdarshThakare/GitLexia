"use client";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import AskQuestionCard from "../dashboard/ask-question";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareDashed } from "lucide-react";
import { toast } from "sonner";

const SavedQuestionSkeleton = () => (
  <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
    <Skeleton className="size-[30px] shrink-0 rounded-full" />
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <Skeleton className="ml-auto h-4 w-20 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full rounded-md" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
    <div className="bg-muted flex items-center justify-center rounded-full p-4">
      <MessageSquareDashed className="text-muted-foreground/60 size-7" />
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-700">
        No saved questions yet
      </p>
      <p className="text-xs text-gray-400">
        Ask GitLexia a question above and save the answer to see it here.
      </p>
    </div>
  </div>
);

const page = () => {
  const { projectId, project, isLoading: projectLoading } = useProject();
  const router = useRouter();

  React.useEffect(() => {
    if (!projectLoading && !project) {
      toast.error("Please select a project first");
      router.push("/create");
    }
  }, [projectLoading, project, router]);

  const { data: questions, isLoading } = api.project.getQuestion.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  if (projectLoading || !project) return null;

  return (
    <Sheet>
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        <AskQuestionCard />

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>
              Saved Questions
            </h1>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
              {questions?.length || 0} Synaptic Records
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="space-y-4">
                <SavedQuestionSkeleton />
                <SavedQuestionSkeleton />
                <SavedQuestionSkeleton />
              </div>
            ) : questions && questions.length > 0 ? (
              questions.map((question, index) => (
                <React.Fragment key={question.id}>
                  <SheetTrigger onClick={() => setQuestionIndex(index)}>
                    <div className="hover:border-indigo-300 flex cursor-pointer items-center gap-6 rounded-md border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md group">
                      <div className="relative">
                        <img
                          className="shrink-0 rounded-md border-2 border-slate-100"
                          height={40}
                          width={40}
                          src={question.user.imageUrl ?? ""}
                        />
                        <div className="absolute -bottom-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex w-full min-w-0 flex-col text-left">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="line-clamp-1 text-lg font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors" style={{ fontFamily: 'sup' }}>
                            {question.question}
                          </p>
                          <span className="ml-auto text-[10px] font-bold whitespace-nowrap text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
                            {question.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="line-clamp-1 text-sm font-medium text-slate-500 leading-relaxed">
                          {question.answer}
                        </div>
                      </div>
                    </div>
                  </SheetTrigger>
                </React.Fragment>
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {question && (
        <SheetContent className="overflow-scroll sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle className="ml-3 text-2xl">
              {question.question}
            </SheetTitle>
            <hr />
            <div
              data-color-mode="light"
              data-theme="light"
              className="rounded-md bg-white p-4 text-black"
            >
              <MDEditor.Markdown source={question.answer} />
            </div>
            <CodeReferences
              fileReferences={question.fileReferences ?? ([] as any)}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default page;
