"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { Activity, Users, GitCommit, FileCode, Search, RefreshCw, AlertCircle, Brain, Sparkles, FileText } from "lucide-react";
import ContributorActivity from "./_components/contributor-activity";
import ActivityPattern from "./_components/activity-pattern";
import ContributorFiltering from "./_components/contributor-filtering";
import RepositoryRadar from "./_components/repository-radar";
import LanguageDistribution from "./_components/language-distribution";
import ContributorGists from "./_components/contributor-gists";
import AIProjectSuggestions from "./_components/ai-project-suggestions";
import MeetingIntelligence from "./_components/meeting-intelligence";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const { projectId } = useProject();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as "overview" | "team" | "project" | "explore" | null;
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "project" | "explore">(tabParam || "overview");

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam || "overview");
    }
  }, [tabParam, activeTab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/analytics?${params.toString()}`);
  };

  const { data, isLoading, isError, error, refetch } = api.project.getProjectAnalytics.useQuery(
    { projectId: projectId || "" },
    { enabled: !!projectId, retry: 2 }
  );

  useEffect(() => {
    if (data) {
      console.log(`[AnalyticsPage] Data loaded. Commits: ${data.dbCommits?.length}`);
    }
  }, [data]);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse bg-slate-50/50 min-h-screen">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-[2rem]" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-[350px]" />
            <Skeleton className="h-4 w-[280px]" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[600px] lg:col-span-2 rounded-[3rem]" />
          <Skeleton className="h-[600px] rounded-[3rem]" />
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px] bg-slate-50/50">
        <Alert className="max-w-md shadow-lg border-none bg-white rounded-[2rem] p-8">
          <AlertCircle className="h-6 w-6 text-indigo-500 mb-2" />
          <AlertTitle className="text-xl font-black text-slate-800" style={{ fontFamily: 'sup' }}>Intelligence Offline</AlertTitle>
          <AlertDescription className="text-slate-500 font-medium" style={{ fontFamily: 'sup' }}>Please select a repository to initialize the neural analytics engine.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[500px] p-8 bg-slate-50/50">
        <div className="bg-white border-none rounded-[3rem] p-12 max-w-md text-center shadow-lg">
          <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3" style={{ fontFamily: 'sup' }}>Sync Interrupted</h3>
          <p className="text-slate-500 font-medium mb-8" style={{ fontFamily: 'sup' }}>{error.message}</p>
          <button
            onClick={() => refetch()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-xl shadow-slate-200"
            style={{ fontFamily: 'sup' }}
          >
            Reconnect Engine
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "team", label: "Team", icon: Users },
    { id: "project", label: "Project", icon: GitCommit },
    { id: "explore", label: "Explorer", icon: Search },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-screen pb-20 px-3 2xl:px-12">
      {/* Header Section */}
      <div className="py-12 flex flex-col 2xl:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-white shadow-xl shadow-indigo-100 rounded-md border border-indigo-50">
            <Activity className="text-indigo-600 size-10" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'sup' }}>Performance Analytics</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'sup' }}>AI-Powered Analytics Active</p>
            </div>
          </div>
        </div>

        <div className="flex bg-white/80 p-2 rounded-md border border-slate-100 backdrop-blur-xl shadow-sm self-start md:self-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-md transition-all font-black text-xs uppercase tracking-tight
                    ${isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"}`}
                style={{ fontFamily: 'sup' }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 animate-in fade-in zoom-in-95 duration-1000">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento Grid Stats */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-3 2xl:gap-6">
              {[
                { label: "Network Strength", val: data?.contributorStats?.length || 0, icon: Users, color: "indigo", sub: "Collaborators" },
                { label: "Annual velocity", val: data?.commitActivity?.reduce((acc: number, curr: any) => acc + curr.total, 0).toLocaleString() || 0, icon: GitCommit, color: "violet", sub: "Commits / YR" },
                { label: "Code footprint", val: data?.contributorStats?.reduce((acc: number, curr: any) => acc + curr.weeks.reduce((wAcc: number, w: any) => wAcc + w.a + w.d, 0), 0).toLocaleString() || 0, icon: FileCode, color: "emerald", sub: "Modified Lines" }
              ].map((stat, i) => (
                <div key={i} className="py-10 p-6 2xl:p-10 rounded-md bg-white border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:border-indigo-100 transition-all duration-500 h-[220px]">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" style={{ fontFamily: 'sup' }}>{stat.label}</p>
                    <stat.icon className={`text-${stat.color}-500/20 group-hover:text-${stat.color}-500 transition-colors`} size={24} />
                  </div>
                  <div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>{stat.val}</h3>
                    <p className={`text-xs font-bold text-${stat.color}-500/60 mt-2`} style={{ fontFamily: 'sup' }}>{stat.sub}</p>
                  </div>
                </div>
              ))}

              {/* Large Timeline Chart */}
              <div className="md:col-span-3 rounded-md border border-slate-100 bg-white shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col">

                <div className="flex-1 p-6">
                  <ActivityPattern commitActivity={data?.commitActivity} punchCard={data?.punchCard} />
                </div>
              </div>
            </div>

            {/* Sidebar Overview Charts */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="rounded-md border border-slate-100 bg-white shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col h-[480px]">
                <RepositoryRadar stats={data?.contributorStats} commits={data?.commitActivity} punchCard={data?.punchCard} />
              </div>
              <div className="rounded-md border border-slate-100 bg-white shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col h-[420px]">
                <LanguageDistribution languages={data?.languages} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="flex flex-col gap-12">
            <div className="rounded-md border border-slate-100 bg-white shadow-lg p-12 overflow-hidden min-h-[550px]">
              <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-6" style={{ fontFamily: 'sup' }}>
                <div className="p-2 2xl:p-5 bg-blue-50 rounded-md">
                  <Users className="text-blue-500 size-8 2xl:size-10" />
                </div>
                Contributor Interaction Dynamics
              </h2>
              <div className="h-[500px]">
                <ContributorActivity data={data?.contributorStats} />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Intelligent Gists of Contributors</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1" style={{ fontFamily: 'sup' }}>Semantic mapping of individual functional contributions</p>
                </div>
              </div>
              <ContributorGists stats={data?.contributorStats} commits={data?.dbCommits || []} />
            </div>
          </div>
        )}

        {activeTab === "project" && (
          <div className="flex flex-col gap-12">
            <div className="rounded-md border border-slate-100 bg-white shadow-lg p-12 overflow-hidden min-h-[650px]">
              <h2 className="text-4xl font-black text-slate-900 mb-12 flex items-center gap-6" style={{ fontFamily: 'sup' }}>
                <div className="p-2 2xl:p-5 bg-purple-50 rounded-md">
                  <GitCommit className="text-purple-500 size-8 2xl:size-10" />
                </div>
                Project Growth Rate Analysis
              </h2>
              <div className="h-[700px]">
                <ActivityPattern commitActivity={data?.commitActivity} punchCard={data?.punchCard} />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Project Insights based on your Activity</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1" style={{ fontFamily: 'sup' }}>AI-driven project analysis and focus optimization</p>
                </div>
              </div>
              <AIProjectSuggestions
                projectId={projectId || ""}
                stats={data?.contributorStats}
                activity={data?.commitActivity}
                commits={data?.dbCommits || []}
              />
            </div>
            {/* 
            <div className="flex flex-col gap-8 mt-12 bg-slate-50/50 p-10 rounded-md border border-slate-100 shadow-inner">
               <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Meeting Intelligence Depot</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1" style={{ fontFamily: 'sup' }}>Authentic To-Dos and Strategic Rigor from internal reports</p>
                  </div>
                  <FileText className="size-8 text-indigo-500" />
               </div>
               <MeetingIntelligence projectId={projectId || ""} />
            </div> */}
          </div>
        )}

        {activeTab === "explore" && (
          <div className="rounded-md border border-slate-100 bg-white shadow-lg overflow-hidden min-h-[900px] flex flex-col">
            <ContributorFiltering data={data?.contributorStats} />
            <div className="px-10 py-10 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Individual Contributor Summary</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1" style={{ fontFamily: 'sup' }}>Discover Insights of individual functional contributions</p>
                </div>
              </div>
              <ContributorGists stats={data?.contributorStats} commits={data?.dbCommits || []} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
