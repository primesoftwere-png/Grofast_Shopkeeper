"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Image from 'next/image';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container">
        <h1 className="text-2xl font-bold text-foreground mb-4">Settings Page</h1>
        <p className="text-muted-foreground">Configure your account and shop settings here.</p>
      </div>
    </DashboardLayout>
  );
}
