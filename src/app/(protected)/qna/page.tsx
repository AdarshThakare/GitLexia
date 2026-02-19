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
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareDashed } from "lucide-react";

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
  const { projectId, project } = useProject();
  if (!project) redirect("/create");

  const { data: questions, isLoading } = api.project.getQuestion.useQuery({
    projectId,
  });

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <>
            <SavedQuestionSkeleton />
            <SavedQuestionSkeleton />
            <SavedQuestionSkeleton />
          </>
        ) : questions && questions.length > 0 ? (
          questions.map((question, index) => (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="hover:border-primary/30 flex cursor-pointer items-center gap-4 rounded-lg border bg-white p-4 text-left shadow transition-all duration-200 hover:shadow-md">
                  <img
                    className="shrink-0 rounded-full"
                    height={30}
                    width={30}
                    src={question.user.imageUrl ?? ""}
                  />
                  <div className="flex w-full min-w-0 flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {question.question}
                      </p>
                      <span className="ml-auto text-xs whitespace-nowrap text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="line-clamp-1 text-sm text-gray-500">
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
