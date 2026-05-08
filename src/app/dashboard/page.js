"use client";

import React from "react";
import {
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  IndianRupee,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const incomeData = [
  { day: "Mon", income: 2400 },
  { day: "Tue", income: 1800 },
  { day: "Wed", income: 3200 },
  { day: "Thu", income: 2800 },
  { day: "Fri", income: 3600 },
  { day: "Sat", income: 4200 },
  { day: "Sun", income: 3100 },
];

const recentOrders = [
  { id: "#GF1023", customer: "Ankit Sharma", items: 5, total: "₹485", status: "Delivered" },
  { id: "#GF1024", customer: "Priya Patel", items: 3, total: "₹290", status: "In Transit" },
  { id: "#GF1025", customer: "Rohan Singh", items: 8, total: "₹720", status: "Pending" },
  { id: "#GF1026", customer: "Neha Gupta", items: 2, total: "₹180", status: "Delivered" },
];

const statusColor = {
  Delivered: "bg-primary/15 text-primary-dark",
  "In Transit": "bg-info/15 text-info",
  Pending: "bg-secondary text-secondary-foreground",
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stat Cards (manual instead of StatCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Today's Income",
            value: "₹4,250",
            icon: <IndianRupee className="w-5 h-5 text-primary-dark" />,
            trend: "+12%",
          },
          {
            title: "Monthly Income",
            value: "₹1,24,500",
            icon: <TrendingUp className="w-5 h-5 text-primary-dark" />,
            trend: "+8%",
          },
          {
            title: "Total Orders",
            value: "348",
            icon: <ShoppingCart className="w-5 h-5 text-primary-dark" />,
            trend: "+23",
          },
          {
            title: "Low Stock Alerts",
            value: "7",
            icon: <AlertTriangle className="w-5 h-5 text-warning" />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  {card.value}
                </h3>
                {card.trend && (
                  <p className="text-xs text-primary-dark mt-1">
                    {card.trend}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">
            Weekly Income
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120,16%,90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(0,0%,45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(0,0%,45%)" />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(120,16%,90%)",
                }}
              />
              <Bar
                dataKey="income"
                fill="hsl(103,56%,71%)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Messages */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Messages
          </h3>

          <div className="space-y-3">
            {[
              {
                from: "Delivery Partner",
                msg: "Order #1023 delivered successfully",
                time: "2m ago",
              },
              {
                from: "Customer",
                msg: "Is the organic honey available?",
                time: "15m ago",
              },
              {
                from: "System",
                msg: "Low stock alert: Rice (5kg)",
                time: "1h ago",
              },
            ].map((m, i) => (
              <div key={i} className="p-3 bg-muted rounded-xl">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {m.from}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {m.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {m.msg}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">
          Recent Orders
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3 font-medium text-foreground">
                    {o.id}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {o.customer}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {o.items}
                  </td>
                  <td className="py-3 font-medium text-foreground">
                    {o.total}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                        statusColor[o.status]
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;