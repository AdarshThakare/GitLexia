"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import React, { type ReactNode } from "react";
import AppSidebar from "./app-sidebar";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname, useSearchParams } from "next/navigation";

const BreadcrumbNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathsegments = pathname.split("/").filter(Boolean);

  // Custom logic for Analytics tabs in breadcrumbs
  const activeTab = searchParams.get("tab");
  if (pathname.includes("/analytics") && activeTab) {
    pathsegments.push(activeTab);
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="text-slate-400 font-medium hover:text-slate-900 transition-colors" style={{ fontFamily: 'sup' }}>GitLexia</BreadcrumbLink>
        </BreadcrumbItem>
        {pathsegments.map((segment, index) => (
          <React.Fragment key={segment}>
            <BreadcrumbSeparator className="text-slate-300" />
            <BreadcrumbItem>
              {index === pathsegments.length - 1 ? (
                <BreadcrumbPage className="text-slate-900 font-black capitalize tracking-tight" style={{ fontFamily: 'sup' }}>{segment}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={`/${pathsegments.slice(0, index + 1).join("/")}`}
                  className="text-slate-400 font-medium hover:text-slate-900 transition-colors capitalize"
                  style={{ fontFamily: 'sup' }}
                >
                  {segment}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <SidebarProvider>
      {hasMounted ? <AppSidebar /> : <div className="w-[var(--sidebar-width)] bg-slate-50 border-r border-slate-200 animate-pulse" />}
      <main className="mx-1 my-2 mr-2 w-full flex flex-col">
        {/* Enhanced Navbar */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-x-4 border-t border-l border-r border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 rounded-t-md">
          <div className="flex items-center gap-4 flex-1">
            <React.Suspense fallback={<div className="h-4 w-32 bg-slate-100 animate-pulse rounded" />}>
              <BreadcrumbNav />
            </React.Suspense>
          </div>

          <div className="flex items-center gap-6">
            {/* Command Pallete Trigger / Search */}
            {/* <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:border-slate-300 transition-all cursor-text group">
              <Search className="size-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="text-xs text-slate-400 font-bold pr-8" style={{ fontFamily: 'sup' }}>Search Intelligence...</span>
              <Kbd className="bg-white border-slate-200 text-[10px] px-1.5 py-0">⌘</Kbd>
              <Kbd className="bg-white border-slate-200 text-[10px] px-1.5 py-0">K</Kbd>
            </div> */}

            <div className="h-6 w-px bg-slate-200" />

            <div className="min-w-[40px] flex justify-center">
              {hasMounted ? <UserButton afterSignOutUrl="/" /> : <div className="size-10 rounded-full bg-slate-100 animate-pulse" />}
            </div>
          </div>
        </div>

        <div className="flex-1 border-slate-200 bg-slate-50/30 overflow-y-auto rounded-b-md border p-6 shadow-sm">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
