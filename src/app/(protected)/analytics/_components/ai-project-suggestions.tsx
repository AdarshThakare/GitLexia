"use client";

import React from "react";
import { Sparkles, TrendingUp, Lightbulb, Target, ArrowRight, Loader2, AlertCircle, RefreshCw, Brain } from "lucide-react";
import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";

interface AIProjectSuggestionsProps {
   projectId: string;
   stats: any;
   activity: any;
   commits: any;
}

export default function AIProjectSuggestions({ projectId, stats, activity, commits }: AIProjectSuggestionsProps) {
   console.log(`[AIProjectSuggestions] Rendering for ${projectId}. Commits count: ${commits?.length}`);

   const queryInput = React.useMemo(() => {
      console.log(`[AIProjectSuggestions] Recalculating query input for ${projectId}`);
      return {
         projectId: projectId || "",
      };
   }, [projectId]);

   const { data, isLoading, isError, error, refetch } = api.project.getAIProjectSuggestions.useQuery(
      queryInput,
      {
         enabled: !!queryInput.projectId && !!commits && commits.length > 0,
         retry: 1
      }
   );

   console.log(`[AIProjectSuggestions] Query state:`, { isLoading, isError, hasData: !!data });

   if (isLoading) {
      return (
         <Card className="p-12 border-none shadow-2xl shadow-indigo-100/50 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px] rounded-[3rem]">
            <div className="relative">
               <Loader2 className="size-12 text-indigo-500 animate-spin" />
            </div>
            <p className="mt-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]" style={{ fontFamily: 'sup' }}>Synthesizing Project Report Analysis...</p>
            <p className="mt-2 text-[10px] text-slate-300 font-bold uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Analyzing Latest Project Contributions...</p>
         </Card>
      );
   }

   if (isError) {
      return (
         <Card className="p-12 border-none shadow-2xl shadow-rose-100/50 bg-white flex flex-col items-center justify-center min-h-[400px] rounded-[3rem]">
            <div className="p-4 bg-rose-50 rounded-2xl mb-6">
               <AlertCircle className="size-10 text-rose-500" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2" style={{ fontFamily: 'sup' }}>Generation of Progress Report Failed</h4>
            <p className="text-slate-400 text-sm font-medium mb-8 text-center max-w-xs" style={{ fontFamily: 'sup' }}>
               {error?.message || "The neural engine encountered an unexpected interruption."}
            </p>
            <button
               onClick={() => refetch()}
               className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
               style={{ fontFamily: 'sup' }}
            >
               <RefreshCw className="size-4" />
               Retry Analysis
            </button>
         </Card>
      );
   }

   if (!data || (!data.progressPoints?.length && !data.strategicObservations?.length)) {
      return (
         <Card className="p-12 border-none shadow-2xl shadow-slate-100/50 bg-white flex flex-col items-center justify-center min-h-[400px] rounded-[3rem]">
            <Brain className="size-12 text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs" style={{ fontFamily: 'sup' }}>
               {commits?.length === 0 ? "No commits found in database" : "Insufficient Data for Neural Mapping"}
            </p>
            <p className="text-slate-300 text-[10px] mt-2 text-center max-w-xs font-medium" style={{ fontFamily: 'sup' }}>
               {commits?.length === 0
                  ? "The neural engine requires at least one commit summary to generate insights. Try syncing the repository first."
                  : "Collaborate more or add detailed commit summaries to generate strategic insights."}
            </p>
            {commits?.length === 0 && (
               <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  style={{ fontFamily: 'sup' }}
               >
                  Refresh Data
               </button>
            )}
         </Card>
      );
   }

   return (
      <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Assessment - Point Wise */}
            <Card className="p-10 border-none shadow-2xl shadow-indigo-100/50 bg-white group hover:shadow-indigo-200/50 transition-all duration-700 overflow-hidden relative rounded-[3rem]">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <TrendingUp className="size-32 text-indigo-600" />
               </div>
               <div className="flex items-center gap-5 mb-10">
                  <div className="p-4 bg-indigo-50 rounded-[1.5rem] group-hover:bg-indigo-100 transition-colors">
                     <TrendingUp className="size-8 text-indigo-600" />
                  </div>
                  <div>
                     <h4 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Progress Report</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" style={{ fontFamily: 'sup' }}>Neural Links: Latest 7 Commit Context</p>
                  </div>
               </div>
               <div className="space-y-6 relative z-10">
                  {data.progressPoints.map((point: string, idx: number) => (
                     <div key={idx} className="flex gap-4 items-start group/item">
                        <div className="mt-1.5 size-1.5 rounded-full bg-indigo-400 group-hover/item:scale-150 transition-transform shrink-0" />
                        <p className="text-slate-600 font-medium leading-relaxed" style={{ fontFamily: 'sup' }}>{point}</p>
                     </div>
                  ))}
               </div>
            </Card>

            {/* Strategic Observations - Point Wise */}
            <Card className="p-10 border-none shadow-2xl shadow-emerald-100/50 bg-white group hover:shadow-emerald-200/50 transition-all duration-700 overflow-hidden relative rounded-[3rem]">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Target className="size-32 text-emerald-600" />
               </div>
               <div className="flex items-center gap-5 mb-10">
                  <div className="p-4 bg-emerald-50 rounded-[1.5rem] group-hover:bg-emerald-100 transition-colors">
                     <Target className="size-8 text-emerald-600" />
                  </div>
                  <div>
                     <h4 className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Strategic Takeaways</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" style={{ fontFamily: 'sup' }}>Key Points to be observed</p>
                  </div>
               </div>
               <div className="space-y-6 relative z-10">
                  {data.strategicObservations.map((obs: string, idx: number) => (
                     <div key={idx} className="flex gap-4 items-start group/item">
                        <div className="mt-1.5 size-1.5 rounded-full bg-emerald-400 group-hover/item:scale-150 transition-transform shrink-0" />
                        <p className="text-slate-600 font-medium leading-relaxed" style={{ fontFamily: 'sup' }}>{obs}</p>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         {/* Next Focus Tips */}
         <Card className="p-12 border-none shadow-2xl shadow-slate-900/20 bg-slate-900 text-white overflow-hidden relative rounded-[4rem]">
            <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
               <Lightbulb className="size-64 text-amber-400" />
            </div>

            <div className="relative z-10">
               <div className="flex items-center gap-8 mb-12 pb-8 border-b border-white/10">
                  <div className="p-5 bg-amber-400/20 rounded-[2rem] backdrop-blur-xl">
                     <Lightbulb className="size-10 text-amber-400" />
                  </div>
                  <div>
                     <h4 className="text-4xl font-black tracking-tight" style={{ fontFamily: 'sup' }}>What comes next?</h4>
                     <p className="text-xs font-bold text-amber-400/60 uppercase tracking-[0.3em] mt-2" style={{ fontFamily: 'sup' }}>Actionable Operational Objectives</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                  {data.nextSteps.map((step: string, idx: number) => (
                     <div key={idx} className="flex gap-6 group items-start">
                        <div className="mt-1 size-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-amber-400 text-base group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-500 shrink-0 shadow-lg" style={{ fontFamily: 'sup' }}>
                           {idx + 1}
                        </div>
                        <p className="text-slate-300 text-lg font-medium leading-relaxed group-hover:text-white transition-colors" style={{ fontFamily: 'sup' }}>
                           {step}
                        </p>
                     </div>
                  ))}
               </div>

               <div className="mt-16 flex items-center gap-4 text-amber-400/30">
                  <div className="h-px w-12 bg-amber-400/20" />
                  <Sparkles className="size-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ fontFamily: 'sup' }}>Intelligence Vector Optimized</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-400/20 to-transparent" />
               </div>
            </div>
         </Card>
      </div>
   );
}
