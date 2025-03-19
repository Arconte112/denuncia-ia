"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { SupportButton } from "@/components/support/support-button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:block" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
        <SupportButton />
      </main>
    </div>
  );
} 