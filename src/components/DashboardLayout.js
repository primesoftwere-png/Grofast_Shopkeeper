"use client";

import React from "react";
import AppSidebar from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full bg-muted/50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;