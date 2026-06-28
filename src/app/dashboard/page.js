"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
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

const DashboardHome = () => {
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
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardData();
        if (response.success && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Today's Income",
                value: data.stats.todaysIncome,
                icon: <IndianRupee className="w-5 h-5 text-primary-dark" />,
              },
              {
                title: "Monthly Income",
                value: data.stats.monthlyIncome,
                icon: <TrendingUp className="w-5 h-5 text-primary-dark" />,
              },
              {
                title: "Total Orders",
                value: data.stats.totalOrders.toString(),
                icon: <ShoppingCart className="w-5 h-5 text-primary-dark" />,
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
                      {card.value}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">
              Weekly Income
            </h3>

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
                  {data.recentOrders && data.recentOrders.length > 0 ? (
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
        </>
      )}
    </div>
  );
};

export default DashboardHome;