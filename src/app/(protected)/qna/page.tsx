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
import { MessageSquareDashed, MessageCircle, FileText, Bot, User } from "lucide-react";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

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

const SavedChatSkeleton = () => (
  <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
    <Skeleton className="size-[30px] shrink-0 rounded-full" />
    <div className="flex w-full flex-col gap-2">
      <Skeleton className="h-5 w-2/3 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
    </div>
  </div>
);

const EmptyState = ({ message, submessage, icon: Icon }: { message: string, submessage: string, icon: any }) => (
  <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
    <div className="bg-muted flex items-center justify-center rounded-full p-4">
      <Icon className="text-muted-foreground/60 size-7" />
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-700">
        {message}
      </p>
      <p className="text-xs text-gray-400">
        {submessage}
      </p>
    </div>
  </div>
);

const QnAPage = () => {
  const { projectId, project, isLoading: projectLoading } = useProject();
  const router = useRouter();

  React.useEffect(() => {
    if (!projectLoading && !project) {
      toast.error("Please select a project first");
      router.push("/create");
    }
  }, [projectLoading, project, router]);

  const { data: questions, isLoading: questionsLoading } = api.project.getQuestion.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const { data: chats, isLoading: chatsLoading } = api.project.getChats.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [chatIndex, setChatIndex] = useState(0);
  const [viewType, setViewType] = useState<'question' | 'chat'>('question');

  if (projectLoading || !project) return null;

  const currentQuestion = questions?.[questionIndex];
  const currentChat = chats?.[chatIndex];

  return (
    <Sheet>
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        <AskQuestionCard />

        <Tabs defaultValue="questions" className="w-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>
              Saved Collections
            </h1>
            <TabsList className="bg-slate-100/50 p-1 rounded-full h-10 border border-slate-200">
              <TabsTrigger value="questions" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                <FileText className="size-4 mr-2" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="chats" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                <MessageCircle className="size-4 mr-2" />
                Chats
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="questions" className="mt-4 focus-visible:outline-none">
            <div className="flex flex-col gap-4">
              {questionsLoading ? (
                <div className="space-y-4">
                  <SavedQuestionSkeleton />
                  <SavedQuestionSkeleton />
                </div>
              ) : questions && questions.length > 0 ? (
                questions.map((question, index) => (
                  <React.Fragment key={question.id}>
                    <SheetTrigger onClick={() => { setQuestionIndex(index); setViewType('question'); }}>
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
                <EmptyState
                  message="No saved questions yet"
                  submessage="Ask GitLexia a question above and save the answer to see it here."
                  icon={MessageSquareDashed}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="chats" className="mt-4 focus-visible:outline-none">
            <div className="flex flex-col gap-4">
              {chatsLoading ? (
                <div className="space-y-4">
                  <SavedChatSkeleton />
                  <SavedChatSkeleton />
                </div>
              ) : chats && chats.length > 0 ? (
                chats.map((chat, index) => (
                  <SheetTrigger key={chat.id} onClick={() => { setChatIndex(index); setViewType('chat'); }}>
                    <div className="hover:border-blue-300 flex cursor-pointer items-center gap-6 rounded-md border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:shadow-md group">
                      <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <MessageCircle className="size-5" />
                      </div>
                      <div className="flex w-full min-w-0 flex-col text-left">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="line-clamp-1 text-lg font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'sup' }}>
                            {chat.title}
                          </p>
                          <span className="ml-auto text-[10px] font-bold whitespace-nowrap text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
                            {chat.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="line-clamp-1 text-sm font-medium text-slate-500 leading-relaxed">
                          {(chat.messages as any).length} Synaptic Interchanges
                        </div>
                      </div>
                    </div>
                  </SheetTrigger>
                ))
              ) : (
                <EmptyState
                  message="No saved dialogues yet"
                  submessage="Continue a question in chat and save it to see it here."
                  icon={MessageCircle}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SheetContent className="overflow-scroll sm:max-w-[80vw]">
        <SheetHeader>
          <SheetTitle className="ml-3 text-2xl font-black tracking-tight" style={{ fontFamily: 'sup' }}>
            {viewType === 'question' ? currentQuestion?.question : currentChat?.title}
          </SheetTitle>
          <hr className="my-4 border-slate-100" />

          <div className="flex flex-col gap-6">
            {viewType === 'question' && currentQuestion ? (
              <>
                <div
                  data-color-mode="light"
                  data-theme="light"
                  className="rounded-md bg-white p-4 text-black border border-slate-100 shadow-sm"
                >
                  <MDEditor.Markdown source={currentQuestion.answer} />
                </div>
                <CodeReferences
                  fileReferences={currentQuestion.fileReferences as any ?? ([] as any)}
                />
              </>
            ) : viewType === 'chat' && currentChat ? (
              <div className="flex flex-col gap-6">
                {(currentChat.messages as any).map((m: any, idx: number) => (
                  <div key={idx} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${m.role === 'user' ? 'text-slate-400' : 'text-blue-500'}`}>
                      {m.role === 'user' ? <User className="size-3" /> : <Bot className="size-3" />}
                      {m.role}
                    </div>
                    <div className={`max-w-[90%] rounded-xl p-4 shadow-sm text-sm border ${m.role === 'user'
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-blue-50/30 border-blue-100 text-slate-800'
                      }`}>
                      <MDEditor.Markdown source={m.content} style={{ backgroundColor: 'transparent' }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="default"
                    className="rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      localStorage.setItem("gitlexia-chat-init", JSON.stringify(currentChat.messages));
                      window.location.href = "/qna/chat";
                    }}
                  >
                    <Bot className="size-4 mr-2" />
                    Resume this Dialogue
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default QnAPage;
