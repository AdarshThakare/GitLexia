"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { uploadFile } from "@/lib/firebase";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Projector, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const UploadingMeetingCard = () => {
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
      className="relative w-full cursor-pointer overflow-hidden rounded-2xl border border-blue-200/60 bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50"
    >
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl" />
      <div className="pointer-events-none absolute right-1/3 bottom-0 h-32 w-32 rounded-full bg-blue-300/10 blur-2xl" />

      {!isUploading && (
        <div className="relative flex flex-col items-center justify-center gap-4 px-8 text-center sm:flex-row sm:justify-between sm:text-left">
          {/* Left: icon + text */}
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
              <Projector className="size-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Create a New Meeting
              </h3>
              <p className="mt-0.5 text-sm text-blue-100/80">
                Upload your audio and get AI-powered insights instantly
              </p>
              <p className="mt-1 text-xs text-blue-200/60">
                MP3 · WAV · M4A &nbsp;·&nbsp; Max 50MB
              </p>
            </div>
          </div>

          {/* Right: upload button */}
          <div className="shrink-0">
            <Button
              disabled={isUploading}
              size="sm"
              className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-blue-600 shadow-md transition-all duration-200 hover:scale-[1.03] hover:bg-blue-50 hover:shadow-lg"
            >
              <Upload className="mr-2 size-4" />
              Upload Meeting
              <input type="text" {...getInputProps()} className="hidden" />
            </Button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="relative flex flex-col items-center justify-center gap-5 px-8 py-10 sm:flex-row sm:gap-10">
          {/* Circular progress */}
          <div className="relative size-24 shrink-0">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="white"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={
                  2 * Math.PI * 45 - (progress / 100) * 2 * Math.PI * 45
                }
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-semibold text-white">
                {progress}%
              </span>
            </div>
          </div>

          {/* Upload status text */}
          <div>
            <p className="text-base font-semibold text-white">
              Uploading your meeting…
            </p>
            <p className="mt-1 text-sm text-blue-100/70">
              Please keep this tab open until the upload completes.
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-64 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UploadingMeetingCard;
