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
      className="rounded-full flex justify-center items-center gap-3"
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
      <Trash2 className="h-4 w-4 text-white" />
      <span className="text-white" style={{ fontFamily: 'sup' }}>Remove Project</span>
    </Button>
  );
};

export default ArchiveButton;
