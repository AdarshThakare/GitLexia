"use client";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { Calendar, FileText, Trash2, ArrowRight, Mic } from "lucide-react";
import UploadingMeetingCard from "./upload-meeting";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

const MeetingRowSkeleton = () => (
  <li className="flex items-center justify-between gap-x-6 rounded-xl border border-stone-100 bg-white px-5 py-4 shadow-sm">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-5 w-1/3 rounded-md" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-16 rounded-lg" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  </li>
);

const EmptyState = () => (
  <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
    <div className="bg-muted flex items-center justify-center rounded-full p-4">
      <Mic className="text-muted-foreground/60 size-7" />
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-700">No meetings yet</p>
      <p className="text-xs text-gray-400">
        Upload a recording above and GitLexia will analyse it for you.
      </p>
    </div>
  </div>
);

const MeetingsPage = () => {
  const { projectId, project, isLoading: projectLoading } = useProject();
  const router = useRouter();

  React.useEffect(() => {
    if (!projectLoading && !project) {
      toast.error("Please select a project first");
      router.push("/create");
    }
  }, [projectLoading, project, router]);

  if (projectLoading || !project) return null;

  const [status, setStatus] = React.useState("");
  const [progress, setProgress] = React.useState(0);

  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    {
      refetchInterval: 4000,
    },
  );

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    const hasProcessing = meetings?.some((m) => m.status === "PROCESSING");
    if (hasProcessing) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p < 33) {
            setStatus("Assessing the files...");
            return p + 1;
          }
          if (p < 66) {
            setStatus("Exploring all the docs...");
            return p + 1;
          }
          if (p < 99) {
            setStatus("Generating Recording Archives...");
            return p + 1;
          }
          return p;
        });
      }, 1500);
    } else {
      setProgress(0);
      setStatus("");
    }
    return () => clearInterval(interval);
  }, [meetings]);

  const deleteMeeting = api.project.deleteMeetings.useMutation();
  const refetch = useRefetch();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="bg-white rounded-md border border-slate-200 p-2 shadow-sm">
        <UploadingMeetingCard />
      </div>

      {meetings?.some((m) => m.status === "PROCESSING") && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="animate-pulse font-semibold text-blue-700">
              {status}
            </span>
            <span className="font-medium text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-blue-100" />
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>
              Recording Archives
            </h1>
            <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
              Neural Analysis of Collaborative Sessions
            </p>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
            {meetings?.length || 0} Sessions Indexed
          </div>
        </div>

        <ul className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <MeetingRowSkeleton />
              <MeetingRowSkeleton />
              <MeetingRowSkeleton />
            </div>
          ) : !meetings || meetings.length === 0 ? (
            <EmptyState />
          ) : (
            meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="group relative flex items-center justify-between gap-x-6 rounded-md border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-md"
              >
                {/* Left */}
                <div className="min-w-0 flex-1 flex items-center gap-6">
                  <div className="p-3 bg-slate-50 rounded-md group-hover:bg-indigo-50 transition-colors">
                    <Mic className={`size-5 ${meeting.status === 'PROCESSING' ? 'text-amber-500 animate-pulse' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="text-lg font-black text-slate-800 transition-colors hover:text-indigo-600 tracking-tight"
                        style={{ fontFamily: 'sup' }}
                      >
                        {meeting.name}
                      </Link>
                      {meeting.status === "PROCESSING" && (
                        <Badge className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-600 border-amber-200 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
                          Syncing…
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {meeting.createdAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="size-1 rounded-full bg-slate-200" />
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        {meeting.issues.length}{" "}
                        {meeting.issues.length === 1 ? "Strategic Insight" : "Strategic Insights"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-none items-center gap-3">
                  <Link href={`/meetings/${meeting.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-2 rounded-md border-slate-200 px-4 text-xs font-black text-slate-600 transition-all hover:bg-slate-900 hover:text-white uppercase tracking-tight"
                      style={{ fontFamily: 'sup' }}
                    >
                      Retrieve
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      deleteMeeting.mutate(
                        { meetingId: meeting.id },
                        {
                          onSuccess: () => {
                            toast.success("Session purged from memory");
                            refetch();
                          },
                        },
                      )
                    }
                    disabled={deleteMeeting.isPending}
                    className="h-9 w-9 rounded-md p-0 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default MeetingsPage;
