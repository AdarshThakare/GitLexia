import { SidebarProvider } from "@/components/ui/sidebar";
import React, { type ReactNode } from "react";
import AppSidebar from "./app-sidebar";
import SearchBar from "./search-bar";
import { UserButton } from "@clerk/nextjs";

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          <SearchBar />
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        <div className="border-sidebar-border bg-sidebar h-[calc(100vh-5rem)] overflow-y-scroll rounded-md border p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
