"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Image from 'next/image';

export default function AdsPage() {
  return (
    <DashboardLayout>
      <div className="container">
        <h1 className="text-2xl font-bold text-foreground mb-4">Ads & Banner Page</h1>
        <p className="text-muted-foreground">Manage your advertisements and banners here.</p>
      </div>
    </DashboardLayout>
  );
}
