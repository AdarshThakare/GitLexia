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

const page = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestion.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <img
                    className="rounded-full"
                    height={30}
                    width={30}
                    src={question.user.imageUrl ?? ""}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {question.question}
                      </p>
                      <span className="text-xs whitespace-nowrap text-gray-400">
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
          );
        })}
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
