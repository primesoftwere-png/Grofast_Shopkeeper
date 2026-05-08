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

const AppSidebar = () => {
  const pathname = usePathname();

  // simple collapse toggle (manual replacement of useSidebar)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen border-r border-sidebar-border bg-card transition-all ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-primary-foreground" />
        </div>

        {!collapsed && (
          <span className="text-lg font-bold text-foreground">
            GroFast
          </span>
        )}
      </div>

      {/* Menu */}
      <div className="px-2 space-y-1">
        {menuItems.map((item) => {
          const active = pathname === item.url;

          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                active
                  ? "bg-primary/15 text-primary-dark font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />

              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </div>

      {/* Toggle Button */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {collapsed ? ">>" : "<<"}
        </button>
      </div>
    </div>
  );
};

export default AppSidebar;