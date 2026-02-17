import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import React, { useState } from "react";
import { askQuestion } from "./actions";
import MDEditor from "@uiw/react-md-editor";

import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileReferences, setFileReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");
  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFileReferences([]);
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);
    const { output, fileReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFileReferences(fileReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };

  const refetch = useRefetch();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-scroll sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>
              <div className="mx-3 flex flex-row items-center gap-3">
                <Image src="/icon.png" alt="GitLexia" width={30} height={30} />
                <h1 className="text-xl">
                  {question.charAt(0).toUpperCase() + question.slice(1)}
                </h1>
                <Button
                  variant={"outline"}
                  disabled={saveAnswer.isPending}
                  onClick={() => {
                    console.log({
                      projectId: project!.id,
                      question,
                      answer,
                      fileReferences,
                    });
                    saveAnswer.mutate(
                      {
                        projectId: project!.id,
                        question,
                        answer,
                        fileReferences,
                      },
                      {
                        onSuccess: () => {
                          toast.success("Answer saved!");
                          refetch();
                        },
                        onError: () => {
                          toast.error("Failed to save answer!");
                        },
                      },
                    );
                  }}
                >
                  Save Answer
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="-mt-4 flex flex-col items-center">
            <div
              data-color-mode="light"
              data-theme="light"
              className="rounded-md bg-white p-4 text-black"
            >
              <MDEditor.Markdown
                source={answer}
                className="h-full! max-h-[50vh] max-w-[70vw] overflow-scroll"
              />
            </div>
            <div className="h-2"></div>
            <CodeReferences fileReferences={fileReferences} />
            <div className="h-4"></div>
            <Button
              className="w-full max-w-[70vw]"
              type="button"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-border/40 bg-background hover:border-primary/40 relative col-span-3">
        <CardHeader>
          <CardTitle className="text-xl">
            Need Insights ? Ask your Question Here.
          </CardTitle>
          <h5 className="-mt-2 mb-3 text-sm tracking-wide text-gray-400">
            GitLexia has all the Knowledge of your Codebase
          </h5>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Ex. Which file should I edit to change the home page ?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="-mt-4"
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading} className="rounded-full!">
              Ask it to GitLexia!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
