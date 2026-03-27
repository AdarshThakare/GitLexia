import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { askQuestion } from "./actions";
import MDEditor from "@uiw/react-md-editor";

import CodeReferences from "./code-references";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { ChronicleButton } from "@/components/ui/chronicle-button";

const BAUHAUS_CARD_STYLES = `
.bauhaus-card {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  min-height: 20rem;
  display: flex;
  place-content: center;
  place-items: center;
  text-align: center;
  box-shadow: 1px 12px 25px rgb(0,0,0/4%);
  border-radius: var(--card-radius, 20px);
  border: var(--card-border-width, 2px) solid transparent;
  --rotation: 4.2rad;
  background-image:
    linear-gradient(var(--card-bg, #151419), var(--card-bg, #151419)),
    linear-gradient(calc(var(--rotation,4.2rad)), var(--card-accent, #156ef6) 0, var(--card-bg, #151419) 30%, transparent 80%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  color: var(--card-text-main, #f0f0f1);
  transition: transform 0.3s ease;
}
.bauhaus-card:hover {
  transform: translateY(-2px);
  box-shadow: 1px 16px 30px rgb(0,0,0/8%);
}
.bauhaus-card::before {
  position: absolute;
  content: "";
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 2.25rem;
  z-index: -1;
  border: 0.155rem solid transparent;
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}
.bauhaus-card-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2em 1.5em;
}
.bauhaus-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding-top: 7px;
  padding-bottom: 7px;
}
.bauhaus-date {
  color: var(--card-text-top, #bfc7d5);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.bauhaus-card-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.25em 1rem 1.5em;
  border-bottom-left-radius: 2.25rem;
  border-bottom-right-radius: 2.25rem;
  border-top: 0.063rem solid var(--card-separator, #2F2B2A);
}
`;

function injectBauhausCardStyles() {
    if (typeof window === "undefined") return;
    if (!document.getElementById("bauhaus-meeting-card-styles")) {
        const style = document.createElement("style");
        style.id = "bauhaus-meeting-card-styles";
        style.innerHTML = BAUHAUS_CARD_STYLES;
        document.head.appendChild(style);
    }
}

const AskMeCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileReferences, setFileReferences] = useState<
        { fileName: string; sourceCode: string; summary: string }[]
    >([]);
    const [answer, setAnswer] = useState("");
    const saveAnswer = api.project.saveAnswer.useMutation();

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        injectBauhausCardStyles();
        const card = cardRef.current;
        const handleMouseMove = (e: MouseEvent) => {
            if (card) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const angle = Math.atan2(-x, y);
                card.style.setProperty("--rotation", angle + "rad");
            }
        };
        if (card) {
            card.addEventListener("mousemove", handleMouseMove);
        }
        return () => {
            if (card) {
                card.removeEventListener("mousemove", handleMouseMove);
            }
        };
    }, []);

    const executeAsk = async () => {
        if (!project?.id) return;
        setLoading(true);
        setAnswer("");
        setFileReferences([]);

        try {
            const { output, fileReferences } = await askQuestion(question, project.id);
            setFileReferences(fileReferences);
            setOpen(true);

            for await (const delta of output) {
                if (delta) {
                    setAnswer((ans) => ans + delta);
                }
            }
        } catch (e) {
            toast.error("Failed to ask question");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await executeAsk();
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
                        <DialogDescription className="sr-only">
                            Answer for your codebase question
                        </DialogDescription>
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

            <Card className="col-span-3 border-none bg-white shadow-none h-full">
                <div
                    className="bauhaus-card"
                    ref={cardRef}
                    style={{
                        "--card-bg": "#fffffffe",



                        "--card-text-main": "var(--bauhaus-card-inscription-main)",
                        "--card-text-sub": "var(--bauhaus-card-inscription-sub)",
                        "--card-separator": "white",
                    } as React.CSSProperties}
                >

                    <div className="bauhaus-card-header ">
                        <div className="bauhaus-date text-black!">ASK GITLEXIA</div>
                    </div>

                    <div className="bauhaus-card-body px-8">

                        <h3>Need Insights? Ask your Question!</h3>
                        <p className="text-black/60!">GitLexia has all the Knowledge of your Codebase</p>

                        <form onSubmit={onSubmit} className="w-full mt-4 z-30 px-4 relative">
                            <Textarea
                                placeholder="Ex. Which file should I edit to change the home page ?"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="resize-none bg-white/40 dark:bg-black/20 border-black/40 p-3 w-full! dark:border-white/10 focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[70px] placeholder:text-slate-400"
                                rows={2}
                            />
                            <button type="submit" className="hidden" />
                        </form>
                    </div>

                    <div className="bauhaus-card-footer">
                        <div className="bauhaus-button-container relative z-30">
                            <ChronicleButton
                                text={loading ? "Analyzing..." : "Ask GitLexia!"}
                                width="220px"
                                disabled={loading || !question.trim()}
                                onClick={() => {
                                    if (question.trim() && !loading) {
                                        executeAsk();
                                    }
                                }}
                                customBackground="var(--primary)"
                                customForeground="var(--bauhaus-chronicle-fg)"
                                hoverForeground="var(--bauhaus-chronicle-hover-fg)"
                                hoverColor="var(--chart-5)"
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
};

export default AskMeCard;
