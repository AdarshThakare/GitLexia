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
      className="col-span-2 flex cursor-pointer flex-col items-center p-8 justify-center rounded-xl border border-blue-500/20 bg-linear-to-br from-blue-50 via-white to-blue-100 text-center transition-all duration-300 hover:border-blue-500/50 hover:shadow-md"
    >
      {!isUploading && (
        <>
          {/* Icon */}
          <div className="flex items-center justify-center rounded-full bg-blue-500/10 p-3 transition-all duration-300 hover:bg-blue-500/20">
            <Projector className="size-8 text-blue-600 transition-transform duration-300 hover:scale-110" />
          </div>

          {/* Title */}
          <h3 className="-mt-3 text-xl font-semibold text-blue-900">
            Create a New Meeting
          </h3>

          {/* Small Footer Note */}
          <p className="-mt-4 text-[10px] text-blue-800/60">
            MP3 • WAV • M4A (Max 50MB)
          </p>

          {/* Upload Button */}
          <div className="-mt-2">
            <Button
              disabled={isUploading}
              size="sm"
              className="rounded-full! bg-blue-600 px-4! py-2! text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700"
            >
              <Upload className="mr-2 size-4" />
              Upload Meeting Recording
              <input type="text" {...getInputProps()} className="hidden" />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative size-28">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
              />

              {/* Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#2563eb"
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

            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-semibold text-black">
                {progress}%
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500">Uploading your meeting...</p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
