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
  const { projectId, project } = useProject();
  if (!project) redirect("/create");

  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    { refetchInterval: 4000 },
  );
  const deleteMeeting = api.project.deleteMeetings.useMutation();
  const refetch = useRefetch();

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <UploadingMeetingCard />
      <div className="h-4" />

      <div className="mb-6 border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-800">
          Meetings
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Review and manage your recorded sessions
        </p>
      </div>

      <ul className="space-y-2">
        {isLoading ? (
          <>
            <MeetingRowSkeleton />
            <MeetingRowSkeleton />
            <MeetingRowSkeleton />
          </>
        ) : !meetings || meetings.length === 0 ? (
          <EmptyState />
        ) : (
          meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="group relative flex items-center justify-between gap-x-6 rounded-xl border border-stone-100 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:border-stone-200 hover:shadow-md"
            >
              {/* Left */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-md font-semibold text-stone-800 transition-colors hover:text-stone-600"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <Badge className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 ring-1 ring-amber-200">
                      Processing…
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {meeting.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-stone-300" />
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {meeting.issues.length}{" "}
                    {meeting.issues.length === 1 ? "issue" : "issues"}
                  </span>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-none items-center gap-2">
                <Link href={`/meetings/${meeting.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 rounded-lg border-stone-200 px-3 text-xs text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
                  >
                    View
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
                          toast.success("Meeting deleted successfully");
                          refetch();
                        },
                      },
                    )
                  }
                  disabled={deleteMeeting.isPending}
                  className="h-8 w-8 rounded-lg p-0 text-black transition-all hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default MeetingsPage;
