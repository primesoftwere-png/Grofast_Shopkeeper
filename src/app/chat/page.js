"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Image from 'next/image';

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="container">
        <h1 className="text-2xl font-bold text-foreground mb-4">Chat Page</h1>
        <p className="text-muted-foreground">Chat with customers and delivery partners here.</p>
      </div>
    </DashboardLayout>
  );
}
