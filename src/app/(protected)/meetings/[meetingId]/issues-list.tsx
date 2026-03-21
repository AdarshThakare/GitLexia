"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type RouterOutputs } from "@/trpc/react";
import { VideoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

type Props = {
  meetingId: string;
};

const IssuesList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    {
      refetchInterval: (query) => {
        return query.state.data?.status === "PROCESSING" ? 4000 : false;
      },
    },
  );

  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (meeting?.status === "PROCESSING") {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p < 25) {
            setStatus("Transcribing the content...");
            return p + 1;
          }
          if (p < 50) {
            setStatus("Analysing the contents...");
            return p + 1;
          }
          if (p < 75) {
            setStatus("Parsing the meets...");
            return p + 1;
          }
          if (p < 99) {
            setStatus("Loading the reports...");
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
  }, [meeting?.status]);

  if (isLoading || !meeting) return <div className="">Loading...</div>;
  return (
    <>
      <div className="p-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:max-w-none">
          <div className="flex items-center gap-x-8">
            <div className="rounded-full border-white bg-white p-3">
              <VideoIcon className="size-6" />
            </div>
            <h1>
              <div className="text-sm leading-6 text-gray-600">
                Meeting on {meeting.createdAt.toLocaleDateString()}{" "}
              </div>
              <div className="mt-1 text-base leading-6 font-semibold text-gray-900">
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>

        <div className="h-4"></div>
        {meeting.status === "PROCESSING" ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="animate-pulse font-semibold text-blue-700">
                {status || "Processing..."}
              </span>
              <span className="font-medium text-blue-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5 bg-blue-100" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
            <IssueCard issue={meeting.issues} />
          </div>
        )}
      </div>
    </>
  );
};
function IssueCard({
  issue,
}: {
  issue: NonNullable<
    RouterOutputs["project"]["getMeetingById"]
  >["issues"][][number];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="no-scrollbar mt-6 h-[85vh] w-full overflow-scroll">
            <DialogHeader>
              <DialogTitle>{issue[0]?.headline}</DialogTitle>
              <DialogDescription>
                Issued at {issue[0]?.createdAt.toLocaleDateString()}
              </DialogDescription>
              {issue.map((issue) => (
                <blockquote
                  key={issue.id}
                  className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4"
                >
                  <span className="text-sm text-gray-600">
                    {issue.start} - {issue.end}
                  </span>
                  <p className="leading-relaxed font-medium text-gray-900 italic">
                    {issue.text}
                  </p>
                </blockquote>
              ))}
            </DialogHeader>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{issue[0]?.headline}</CardTitle>
          <div className="border-b"></div>
          <CardDescription className="text-md">
            {issue[0]?.summary.filter(Boolean).map((point, index) => (
              <li key={index} className="mb-2">
                {point}
              </li>
            ))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)}>View Details</Button>
        </CardContent>
      </Card>
    </>
  );
}
export default IssuesList;
