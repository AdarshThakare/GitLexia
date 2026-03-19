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
import { redirect } from "next/navigation";

const DashboardPage = () => {
  const { project } = useProject();
  if (!project) redirect("/create");

  localStorage.setItem("project-id", project.id);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="bg-white rounded-md border border-slate-200 px-6 py-4 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all">
          <div className="p-2 bg-slate-900 rounded-md group-hover:bg-indigo-600 transition-colors">
            <Github className="size-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Repository Origin</p>
            <Link
              href={project?.githubUrl ?? ""}
              target="_blank"
              className="inline-flex items-center text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors"
              style={{ fontFamily: 'sup' }}
            >
              {project?.githubUrl}
              <ExternalLink className="ml-1.5 size-3 opacity-50" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white px-6 py-4  rounded-md border border-slate-100 shadow-sm">
          <TeamMembers />
          <div className="h-6 w-px bg-slate-100 mx-1" />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-12">

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="">
              <AskQuestionCard />
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
              Commit Stream for Summaries
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
