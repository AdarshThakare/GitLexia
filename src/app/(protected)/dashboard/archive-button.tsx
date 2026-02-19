"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();
  return (
    <Button
      disabled={archiveProject.isPending}
      size="lg"
      variant="destructive"
      className="rounded-full"
      onClick={() => {
        archiveProject.mutate(
          { projectId },
          {
            onSuccess: () => {
              toast.success("Project successfully archived.");
              refetch();
            },
            onError: () => {
              toast.error("Failed to archive project");
            },
          },
        );
      }}
    >
      {" "}
      <Trash2 className="h-3.5 w-3.5" /> Remove Project
    </Button>
  );
};

export default ArchiveButton;
