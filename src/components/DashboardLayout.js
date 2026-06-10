"use client";

import React, { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { initializeSocket, disconnectSocket } from "@/services/socketService";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize socket connection when dashboard loads
  useEffect(() => {
    console.log('🚀 Dashboard mounted - initializing socket...');
    const socket = initializeSocket();
    
    if (socket) {
      console.log('✅ Socket initialization attempted');
    } else {
      console.log('ℹ️ Socket not initialized - REST API mode');
    }

    // Cleanup on unmount
    return () => {
      console.log('🔌 Dashboard unmounting');
      // Don't disconnect socket here - let individual pages manage it
    };
  }, []);

  return (
    <div className="h-[100dvh] flex w-full bg-muted/50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-[50] lg:static flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar closeMobile={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;