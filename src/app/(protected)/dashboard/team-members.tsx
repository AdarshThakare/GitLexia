import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {members?.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger asChild>
              <img
                src={member.user.imageUrl || ""}
                alt={member.user.firstName || ""}
                height={30}
                width={30}
                className="cursor-pointer rounded-full"
              />
            </TooltipTrigger>

            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium">
                  {member.user.firstName} {member.user.lastName}
                </p>
                <p className="text-xs text-gray-300">
                  {member.user.emailAddress}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default TeamMembers;
