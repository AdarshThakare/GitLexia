"use client";
import { Card } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { uploadFile } from "@/lib/firebase";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Projector } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ChronicleButton } from "@/components/ui/chronicle-button";

const BAUHAUS_CARD_STYLES = `
.bauhaus-card {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  min-height: 20rem;
  display: flex;
  place-content: center;
  place-items: center;
  text-align: center;
  box-shadow: 1px 12px 25px rgb(0,0,0/8%);
  border-radius: var(--card-radius, 20px);
  border: var(--card-border-width, 2px) solid transparent;
  --rotation: 4.2rad;
  background-image:
    linear-gradient(var(--card-bg, #151419), var(--card-bg, #151419)),
    linear-gradient(calc(var(--rotation,4.2rad)), var(--card-accent, #156ef6) 0, var(--card-bg, #151419) 30%, transparent 80%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  color: var(--card-text-main, #f0f0f1);
  cursor: pointer;
  transition: transform 0.3s ease;
}
.bauhaus-card:hover {
  transform: translateY(-2px);
  box-shadow: 1px 16px 30px rgb(0,0,0/12%);
}
.bauhaus-card::before {
  position: absolute;
  content: "";
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 2.25rem;
  z-index: -1;
  border: 0.155rem solid transparent;
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}
.bauhaus-card-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2em 1.5em;
}
.bauhaus-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding-top: 7px;
  padding-bottom: 7px;
}
.bauhaus-date {
  color: var(--card-text-top, #bfc7d5);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.bauhaus-card-body {
  position: absolute;
  width: 100%;
  display: block;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0.7em 1.25em 0.5em 1.5em;
}
.bauhaus-card-body h3 {
  font-size: 1.375rem;
  margin-top: 0.1em;
  margin-bottom: 0.188em;
  font-weight: 600;
  color: var(--card-text-main, #f0f0f1);
}
.bauhaus-card-body p {
  color: var(--card-text-sub, #a0a1b3);
  font-size: 0.875rem;
  letter-spacing: 0.031rem;
}
.bauhaus-progress {
  margin-top: 1.5rem;
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}
.bauhaus-progress-bar {
  position: relative;
  width: 100%;
  background: var(--card-progress-bar-bg, #363636);
  height: 0.313rem;
  display: block;
  border-radius: 3.125rem;
}
.bauhaus-progress-bar > div {
  height: 5px;
  border-radius: 3.125rem;
  transition: width 0.3s ease;
}
.bauhaus-progress span:first-of-type {
  text-align: left;
  font-weight: 600;
  width: 100%;
  display: block;
  margin-bottom: 0.5rem;
  color: var(--card-text-progress-label, #b4c7e7);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.bauhaus-progress span:last-of-type {
  margin-top: 0.5rem;
  text-align: right;
  display: block;
  color: var(--card-text-progress-value, #e7e7f7);
  font-size: 0.75rem;
}
.bauhaus-card-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.25em 1rem 1.5em;
  border-bottom-left-radius: 2.25rem;
  border-bottom-right-radius: 2.25rem;
  border-top: 0.063rem solid var(--card-separator, #2F2B2A);
}
`;

function injectBauhausCardStyles() {
  if (typeof window === "undefined") return;
  if (!document.getElementById("bauhaus-meeting-card-styles")) {
    const style = document.createElement("style");
    style.id = "bauhaus-meeting-card-styles";
    style.innerHTML = BAUHAUS_CARD_STYLES;
    document.head.appendChild(style);
  }
}

const MeetingCard = () => {
  const { project } = useProject();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectBauhausCardStyles();
    const card = cardRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const angle = Math.atan2(-x, y);
        card.style.setProperty("--rotation", angle + "rad");
      }
    };
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (card) {
        card.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

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
    <Card className="col-span-2 border-none bg-transparent shadow-none">
      <div
        {...getRootProps()}
        className="bauhaus-card"
        ref={cardRef}
        style={{
          "--card-bg": "var(--bauhaus-card-bg)",
          "--card-border": "var(--bauhaus-card-separator)",
          "--card-accent": "var(--bauhaus-card-accent)",
          "--card-radius": "var(--bauhaus-card-radius)",
          "--card-border-width": "var(--bauhaus-card-border-width)",
          "--card-text-top": "var(--bauhaus-card-inscription-top)",
          "--card-text-main": "var(--bauhaus-card-inscription-main)",
          "--card-text-sub": "var(--bauhaus-card-inscription-sub)",
          "--card-text-progress-label": "var(--bauhaus-card-inscription-progress-label)",
          "--card-text-progress-value": "var(--bauhaus-card-inscription-progress-value)",
          "--card-separator": "var(--bauhaus-card-separator)",
          "--card-progress-bar-bg": "var(--bauhaus-card-progress-bar-bg)",
        } as React.CSSProperties}
      >
        <div className="bauhaus-card-header">
          <div className="bauhaus-date">NEW MEETING</div>
        </div>

        <div className="bauhaus-card-body">
          <div className="flex justify-center mb-3">
            <Projector className="size-8 text-blue-600 opacity-90" />
          </div>
          <h3>Create a New Meeting</h3>
          <p>MP3 • WAV • M4A (Max 50MB)</p>

          {isUploading && (
            <div className="bauhaus-progress">
              <span>Uploading your meeting...</span>
              <div className="bauhaus-progress-bar">
                <div
                  style={{
                    width: `${progress}%`,
                    backgroundColor: "var(--bauhaus-card-accent)",
                  }}
                />
              </div>
              <span>{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        <div className="bauhaus-card-footer">
          <div className="bauhaus-button-container relative z-20">
            <ChronicleButton
              text={isUploading ? "Uploading..." : "Upload Recording"}
              width="220px"
              disabled={isUploading}
              customBackground="var(--primary)"
              customForeground="var(--bauhaus-chronicle-fg)"
              hoverForeground="var(--bauhaus-chronicle-hover-fg)"
              hoverColor="var(--chart-5)"
            />
            <input type="text" {...getInputProps()} className="hidden" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MeetingCard;
