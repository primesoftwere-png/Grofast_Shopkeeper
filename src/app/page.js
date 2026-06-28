"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
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

import { getDashboardData } from "@/services/dashboardService";

const statusColor = {
  DELIVERED: "bg-primary/15 text-primary-dark",
  Delivered: "bg-primary/15 text-primary-dark",
  "IN_TRANSIT": "bg-info/15 text-info",
  "In Transit": "bg-info/15 text-info",
  PENDING: "bg-secondary text-secondary-foreground",
  Pending: "bg-secondary text-secondary-foreground",
  CONFIRMED: "bg-primary/15 text-primary-dark",
  ASSIGNED: "bg-info/15 text-info",
  PICKED_UP: "bg-info/15 text-info",
  CANCELLED: "bg-red-100 text-red-600"
};

export default function Home() {
  const [data, setData] = useState({
    stats: { todaysIncome: "₹0", monthlyIncome: "₹0", totalOrders: 0, lowStockAlerts: 0 },
    incomeData: [
      { day: "Sun", income: 0 },
      { day: "Mon", income: 0 },
      { day: "Tue", income: 0 },
      { day: "Wed", income: 0 },
      { day: "Thu", income: 0 },
      { day: "Fri", income: 0 },
      { day: "Sat", income: 0 },
    ],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Today's Income",
              value: data.stats.todaysIncome,
              icon: <IndianRupee className="w-5 h-5 text-primary-dark" />,
              trend: "+12%",
            },
            {
              title: "Monthly Income",
              value: data.stats.monthlyIncome,
              icon: <TrendingUp className="w-5 h-5 text-primary-dark" />,
              trend: "+8%",
            },
            {
              title: "Total Orders",
              value: data.stats.totalOrders.toString(),
              icon: <ShoppingCart className="w-5 h-5 text-primary-dark" />,
              trend: "+23",
            },
            {
              title: "Low Stock Alerts",
              value: data.stats.lowStockAlerts.toString(),
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
                    {loading ? (
                      <span className="inline-block animate-pulse bg-muted h-6 w-20 rounded"></span>
                    ) : (
                      card.value
                    )}
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

            {loading ? (
              <div className="h-[260px] flex items-center justify-center animate-pulse bg-muted/50 rounded-xl">
                <span className="text-muted-foreground">Loading chart...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.incomeData}>
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
            )}
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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-muted-foreground">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-dark mx-auto mb-2"></div>
                      Loading orders...
                    </td>
                  </tr>
                ) : data.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((o, index) => (
                    <tr
                      key={o.id || index}
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
                            statusColor[o.status] || "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-muted-foreground">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
