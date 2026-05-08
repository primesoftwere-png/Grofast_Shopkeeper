"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { logout } from "@/services/authService";

export function TopNavbar() {
  const router = useRouter();

  // Mock user (replace with API / context)
  const [user] = useState({
    name: "Shrey",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    // Remove token from localStorage
    logout();
    console.log("✅ Logged out, token removed");
    // Redirect to login
    router.push("/login");
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Search */}
      <div className="hidden sm:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notification */}
        <button className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0) || "U"}
            </div>

            <span className="hidden sm:block text-sm font-medium text-foreground">
              {user?.name || "User"}
            </span>

            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-elevated py-1 z-50">
              <button
                onClick={() => {
                  router.push("/profile");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <User className="w-4 h-4" /> View Profile
              </button>

              <button
                onClick={() => {
                  router.push("/settings");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>

              <hr className="my-1 border-border" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}