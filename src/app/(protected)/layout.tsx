import { SidebarProvider } from "@/components/ui/sidebar";
import React, { type ReactNode } from "react";
import AppSidebar from "./app-sidebar";
import SearchBar from "./search-bar";
import { UserButton } from "@clerk/nextjs";

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  let projectId;
  () => {
    try {
      projectId = localStorage.getItem("projectId");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="mx-1 my-2 mr-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          <SearchBar projectId={projectId || ""} />
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-2.5"></div>
        <div className="border-sidebar-border bg-sidebar h-[calc(100vh-4.4rem)] overflow-y-scroll rounded-md border p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
