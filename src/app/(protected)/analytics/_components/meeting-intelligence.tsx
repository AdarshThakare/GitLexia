"use client";

import React, { useState } from "react";
import { FileText, Upload, CheckCircle2, ListTodo, Presentation, ShieldAlert, Loader2, User, ChevronRight, Quote, TrendingUp } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface MeetingIntelligenceProps {
  projectId: string;
}

export default function MeetingIntelligence({ projectId }: MeetingIntelligenceProps) {
  const [isUploading, setIsUploading] = useState(false);
  const utils = api.useUtils();

  const { data: reports, isLoading: isLoadingReports } = api.project.getMeetingReports.useQuery({ projectId });
  const uploadMutation = api.project.uploadMeetingReport.useMutation({
    onSuccess: () => {
      toast.success("Intelligence Synchronized", {
        description: "Meeting report has been rigorously evaluated."
      });
      utils.project.getMeetingReports.invalidate();
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error("Sync Failed", {
        description: error.message
      });
      setIsUploading(false);
    }
  });

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Invalid File Type", {
        description: "Please provide a valid PDF document."
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      uploadMutation.mutate({
        projectId,
        name: file.name,
        base64Pdf: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  if (isLoadingReports) {
    return (
      <div className="flex flex-col gap-10">
        <Skeleton className="h-[300px] w-full rounded-[3rem]" />
        <Skeleton className="h-[500px] w-full rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Upload Section */}
      <div 
        {...getRootProps()} 
        className={`group relative overflow-hidden transition-all duration-700 cursor-pointer border-2 border-dashed rounded-[3rem] p-16 text-center flex flex-col items-center justify-center gap-6
          ${isDragActive ? "border-indigo-500 bg-indigo-50/30 scale-[0.98] shadow-inner" : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/30 hover:shadow-2xl hover:shadow-indigo-100/50"}
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl animate-pulse opacity-30" />
              <Loader2 className="size-16 text-indigo-600 animate-spin relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Synthesizing Intelligence</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]" style={{ fontFamily: 'sup' }}>Neural mapping in progress...</p>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-6 transition-transform group-hover:scale-105 duration-700">
            <div className="p-6 bg-indigo-50 rounded-[2rem] group-hover:bg-indigo-100 transition-colors shadow-sm">
              <Upload className="size-10 text-indigo-600 group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>
                {isDragActive ? "Injest Information" : "Ingest Meeting Report"}
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed" style={{ fontFamily: 'sup' }}>
                Drop PDF here to extract authentic per-contributor to-dos and strategic project evaluations.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="space-y-24">
        {reports?.map((report) => (
          <div key={report.id} className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Report Header */}
            <div className="flex items-center gap-6">
              <div className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent" />
              <div className="flex items-center gap-4 bg-white px-8 py-3 rounded-full border border-slate-100 shadow-sm">
                 <Presentation className="size-5 text-indigo-600" />
                 <h4 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>{report.name}</h4>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-2" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
                    {new Date(report.createdAt).toLocaleDateString()}
                 </p>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            </div>

            {/* Evaluation & Next Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <Card className="lg:col-span-7 p-10 border-none shadow-2xl shadow-indigo-100/50 bg-white relative overflow-hidden group rounded-[3rem]">
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <Quote className="size-32 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-2.5 bg-indigo-50 rounded-2xl">
                        <ShieldAlert className="size-5 text-indigo-600" />
                     </div>
                     <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Rigorous Evaluation</h5>
                  </div>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed italic relative z-10" style={{ fontFamily: 'sup' }}>
                    "{report.evaluation}"
                  </p>
               </Card>

               <Card className="lg:col-span-5 p-10 border-none shadow-2xl shadow-slate-200/50 bg-slate-900 text-white relative overflow-hidden rounded-[3rem]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
                        <TrendingUp className="size-5 text-amber-400" />
                     </div>
                     <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Strategic Next Steps</h5>
                  </div>
                  <div className="space-y-6">
                     {report.nextSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-5 items-start group">
                           <div className="mt-2 text-amber-400 font-black text-xs opacity-50 group-hover:opacity-100 transition-opacity" style={{ fontFamily: 'sup' }}>0{idx + 1}</div>
                           <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-relaxed" style={{ fontFamily: 'sup' }}>{step}</p>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>

            {/* Per-Contributor To-Dos */}
            <div className="flex flex-col gap-8">
               <div className="flex items-center gap-4 px-2">
                  <ListTodo className="size-5 text-slate-400" />
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Individual Operational Objectives</h5>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {(report.toDos as any[])?.map((entry, idx) => (
                     <Card key={idx} className="p-8 border-none shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 bg-white rounded-[2.5rem] group border-t border-l border-slate-50">
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
                           <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover:scale-110 transition-transform" style={{ fontFamily: 'sup' }}>
                              {entry.person.slice(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <span className="text-sm font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>{entry.person}</span>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5" style={{ fontFamily: 'sup' }}>Active Contributor</p>
                           </div>
                        </div>
                        <ul className="space-y-4">
                           {entry.tasks.map((task: string, i: number) => (
                              <li key={i} className="flex gap-4 text-xs font-medium text-slate-500 leading-relaxed group/item">
                                 <CheckCircle2 className="size-4 text-slate-200 shrink-0 mt-0.5 group-hover/item:text-emerald-500 transition-colors" />
                                 <span style={{ fontFamily: 'sup' }}>{task}</span>
                              </li>
                           ))}
                        </ul>
                     </Card>
                  ))}
               </div>
            </div>
          </div>
        ))}

        {!isLoadingReports && reports?.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center opacity-40 text-center grayscale animate-in fade-in duration-1000">
             <div className="p-12 border-4 border-slate-200 rounded-[4rem] mb-8 shadow-inner bg-slate-50/50">
                <Presentation className="size-20 text-slate-300" />
             </div>
             <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-800" style={{ fontFamily: 'sup' }}>Intelligence Reservoir Offline</p>
             <p className="text-xs font-bold mt-3 text-slate-500" style={{ fontFamily: 'sup' }}>Awaiting PDF submission for neural mapping</p>
          </div>
        )}
      </div>
    </div>
  );
}
