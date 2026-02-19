"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { uploadFile } from "@/lib/firebase";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Mic, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const MeetingCard = () => {
  const { project } = useProject();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      meetingId: string;
      projectId: string;
    }) => {
      const { meetingUrl, meetingId, projectId } = data;
      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        meetingId,
        projectId,
      });

      return response.data;
    },
  });
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const router = useRouter();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      if (!project) return;
      setIsUploading(true);
      const file = acceptedFiles[0];
      if (!file) return;
      const downloadUrl = (await uploadFile(
        file as File,
        setProgress,
      )) as string;
      uploadMeeting.mutate(
        {
          projectId: project.id,
          meetingUrl: downloadUrl,
          name: file.name,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Meeting Uploaded Successfully");
            router.push("/meetings");
            processMeeting.mutateAsync({
              meetingId: meeting.id,
              meetingUrl: downloadUrl,
              projectId: project.id,
            });
          },
          onError: () => {
            toast.error("Meeting coudn't be uploaded.");
          },
        },
      );
      setIsUploading(false);
    },
  });

  return (
    <Card
      {...getRootProps()}
      className="border-border/40 bg-background hover:border-primary/40 relative col-span-2 cursor-pointer transition-shadow duration-200 hover:shadow-md"
    >
      <CardHeader>
        <CardTitle className="text-xl">
          Want Quick Summaries? Upload a Meeting Recording
        </CardTitle>
        <h5 className="-mt-2 mb-3 text-sm tracking-wide text-gray-400">
          GitLexia will transcribe & analyse your meeting
        </h5>
      </CardHeader>

      <CardContent>
        {!isUploading ? (
          <div className="flex flex-col gap-4">
            {/* Drop zone hint area */}
            <div className="border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/50 -mt-6 flex items-center gap-3 rounded-lg border border-dashed px-4 py-5 text-sm transition-colors duration-150">
              <Mic className="text-muted-foreground/70 size-5 shrink-0" />
              <span>Drag & drop your audio file here, or click to select</span>
            </div>

            <p className="text-xs text-gray-400">
              Supported: MP3 · WAV · M4A &nbsp;·&nbsp; Max 50 MB
            </p>

            <Button
              disabled={isUploading}
              type="button"
              className="w-fit rounded-full!"
            >
              <Upload className="mr-2 size-4" />
              Upload Meeting
              <input type="text" {...getInputProps()} className="hidden" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-5 py-2">
            {/* Circular progress */}
            <div className="relative size-24">
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-border"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={
                    2 * Math.PI * 45 - (progress / 100) * 2 * Math.PI * 45
                  }
                  className="text-primary transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold">{progress}%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Uploading your meeting…
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingCard;
