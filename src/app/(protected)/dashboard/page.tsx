"use client";
import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AskMeCard from "./ask-question-card";

const DashboardPage = () => {
  const { project, isLoading } = useProject();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !project) {
      toast.error("Please select a project first");
      router.push("/create");
    }
  }, [isLoading, project, router]);

  if (isLoading || !project) return null;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="flex  flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="w-full bg-white flex flex-col lg:flex-row justify-between rounded-md border border-slate-200 px-6 py-4 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-start gap-4">
            <div className="p-2 bg-slate-900 rounded-md group-hover:bg-indigo-600 transition-colors">
              <Github className="size-5 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Repository Origin
                <ExternalLink className="ml-1.5 size-3 opacity-50 relative bottom-0.5" />
              </p>

              <Link
                href={project?.githubUrl ?? ""}
                target="_blank"
                className="inline-flex items-center text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors"
                style={{ fontFamily: 'sup' }}
              >
                {project?.githubUrl}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <TeamMembers />
            <div className="h-6 w-px bg-slate-100 border-r border-slate-200 mx-1" />
            <InviteButton />
            <ArchiveButton />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 -mt-8">
        <div className="lg:col-span-12">

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="">
              <AskMeCard />
            </div>
            <div className="">
              <MeetingCard />
            </div>
          </div>
        </div>

        <div className="lg:col-span-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3" style={{ fontFamily: 'sup' }}>
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              Commit Stream of Summaries
            </h2>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Real-time Sync Active</div>
          </div>
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden p-6">
            <CommitLog />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
