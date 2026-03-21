import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects, isLoading } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("project-id", "", {
    initializeWithValue: true,
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  });
  const project = projects?.find((project) => project.id === projectId);

  return { projects, project, projectId, setProjectId, isLoading };
};

export default useProject;
