"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import useProject from "@/hooks/use-project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Send, Bot, User, Save, Trash2, ArrowLeft } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { ChronicleButton } from "@/components/ui/chronicle-button";
import Image from "next/image";
import { UserAvatar, UserProfile } from "@clerk/nextjs";

const ChatPage = () => {
  const { project, projectId } = useProject();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const saveChat = api.project.saveChat.useMutation({
    onSuccess: () => {
      toast.success("Chat saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save chat.");
    }
  });

  const [input, setInput] = useState("");

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    body: {
      projectId: projectId,
    },
  }), [projectId]);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: projectId!,
    transport,
    onError: (err) => {
      toast.error("Chat error: " + err.message);
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const getMessageContent = (m: any) => {
    if (typeof m.content === 'string') return m.content;
    if (Array.isArray(m.parts)) {
      return m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('');
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");
    await sendMessage({ text: currentInput });
  };

  // Load initial context from localStorage if redirected from AskMeCard
  useEffect(() => {
    const init = localStorage.getItem("gitlexia-chat-init");
    if (init) {
      try {
        const parsed = JSON.parse(init);
        setMessages(parsed);
        localStorage.removeItem("gitlexia-chat-init");
      } catch (e) {
        console.error("Failed to parse initial chat messages", e);
      }
    }
  }, [setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onSaveChat = () => {
    if (messages.length === 0) return;
    const firstMsg = (messages as any).find((m: any) => m.role === 'user');
    const content = getMessageContent(firstMsg) || "New Dialogue";
    const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
    saveChat.mutate({
      projectId: projectId!,
      title,
      messages: messages as any,
    });
  };

  if (!project) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight line-clamp-1 max-w-[500px]" style={{ fontFamily: 'sup' }}>
              {(messages[0] as any)?.role === 'user' ? getMessageContent(messages[0]) : "Synaptic Dialogue"}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
              Project: {project.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setMessages([])}
          >
            <Trash2 className="size-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-full bg-blue-600 hover:bg-blue-700"
            onClick={onSaveChat}
            disabled={saveChat.isPending || messages.length === 0}
          >
            <Save className="size-4 mr-2" />
            {saveChat.isPending ? "Saving..." : "Save Dialogue"}
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 pr-4 mb-4 rounded-xl border border-slate-100 bg-slate-50/30 p-4" ref={scrollRef}>
        <div className="flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center text-slate-400">
              <Image src="/icon.png" alt="GitLexia" width={60} height={60} className="size-8 rounded-full text-blue-600" />

              <p className="text-sm font-medium">Initialize a thought stream by asking about your code.</p>
            </div>
          )}

          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex gap-4 ${(m as any).role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {(m as any).role === 'assistant' && (
                <Image src="/icon.png" alt="GitLexia" width={60} height={60} className="size-8 rounded-full text-blue-600" />
              )}

              <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MDEditor.Markdown
                    source={getMessageContent(m)}
                    style={{
                      backgroundColor: 'transparent',
                      color: (m as any).role === 'user' ? 'white' : 'inherit',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {(m as any).role === 'user' && (
                <div className="mt-3">
                  <UserAvatar />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Image src="/icon.png" alt="GitLexia" width={60} height={60} className="size-8 rounded-full text-blue-600" />

              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm italic text-slate-400">
                Thinking for a better solution...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        className="relative mt-auto"
      >
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-slate-200 p-2 shadow-lg focus-within:border-blue-500 transition-all duration-300">
          <Input
            name="prompt"
            placeholder="Message GitLexia..."
            className="border-none focus-visible:ring-0 text-base py-6 bg-transparent h-12 !outline-none shadow-none"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 pr-2">
            <button
              type="submit"
              disabled={isLoading || !input || input.trim() === ""}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center mt-2 text-slate-400 uppercase tracking-widest font-black" style={{ fontFamily: 'sup' }}>
          Powered by GitLexia RAG Intelligence
        </p>
      </form>
    </div>
  );
};

export default ChatPage;
