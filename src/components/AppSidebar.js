"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Grid3X3,
  Boxes,
  DollarSign,
  Megaphone,
  MessageCircle,
  Settings,
  ShoppingBag,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Products", url: "/products", icon: Package },
  { title: "Categories", url: "/categories", icon: Grid3X3 },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Income", url: "/income", icon: DollarSign },
  { title: "Ads & Banner", url: "/ads", icon: Megaphone },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

const AppSidebar = ({ closeMobile }) => {
  const pathname = usePathname();

  // simple collapse toggle (manual replacement of useSidebar)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen border-r border-sidebar-border bg-card transition-all flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>

          {!collapsed && (
            <span className="text-lg font-bold text-foreground">
              GroFast
            </span>
          )}
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={closeMobile}
          className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Menu */}
      <div className="px-2 space-y-1 flex-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const active = pathname === item.url;

          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={() => {
                if(closeMobile) closeMobile();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                active
                  ? "bg-primary/15 text-primary-dark font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />

              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </div>

      {/* Toggle Button (Hidden on Mobile) */}
      <div className="hidden lg:flex w-full justify-center p-4 border-t border-sidebar-border mt-auto">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {collapsed ? ">>" : "<<"}
        </button>
      </div>
    </div>
  );
};

export default AppSidebar;