"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="container">
        <h1 className="text-2xl font-bold text-foreground mb-4">Profile Page</h1>
        <p className="text-muted-foreground">View and edit your profile information here.</p>
      </div>
    </DashboardLayout>
  );
}
