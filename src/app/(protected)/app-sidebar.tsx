"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarItems } from "@/data/sidebar-data";
import useProject from "@/hooks/use-project";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const AppSidebar = () => {
  const pathname = usePathname();
  const { projects, projectId, setProjectId } = useProject();
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarTrigger />
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="logo"
            width={80}
            height={80}
            className="size-12 rounded-full object-cover p-0"
          />
          {open && (
            <h1 className="text-primary/80 text-3xl font-bold">GitLexia</h1>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`${pathname === item.url && "bg-primary! text-white!"}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(projects ?? []).map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <div
                      onClick={() => {
                        setProjectId(item.id);
                      }}
                      className="w-full"
                    >
                      <div
                        className={`text-primary m-0 flex size-6 shrink-0 items-center justify-center rounded-sm border bg-white text-sm ${item.id === projectId && "bg-primary! text-white!"}`}
                      >
                        {item.name[0]}
                      </div>
                      {open && <span>{item.name}</span>}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/create">
                    <Button
                      size="sm"
                      variant={"outline"}
                      className="w-fit grow px-1!"
                    >
                      <div>
                        <Plus />
                      </div>
                      {open && <span>Create New Project</span>}
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
