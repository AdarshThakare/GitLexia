"use client";
import { Button } from "@/components/ui/button";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Card } from "@/components/ui/card";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Projector, Upload } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const MeetingCard = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const file = acceptedFiles[0];
      const downloadFile = await uploadFile(file as File, setProgress);
      window.alert(downloadFile);
      setIsUploading(false);
    },
  });
  return (
    <Card
      {...getRootProps()}
      className="col-span-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-50 via-white to-blue-100 text-center transition-all duration-300 hover:-translate-y-[2px] hover:border-blue-500/50 hover:shadow-lg"
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

          {/* Subtitle */}
          <p className="-mt-5 px-6 text-[13px] text-blue-700/80">
            Upload your Meeting Audio and get AI-powered insights.
          </p>

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
              Upload Meeting
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
