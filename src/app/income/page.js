"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { IndianRupee, TrendingUp, ShoppingCart } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import { getWalletDetails } from "@/services/walletService";

const dailyData = [
  { day: "Mon", revenue: 4200, commission: 420 },
  { day: "Tue", revenue: 3800, commission: 380 },
  { day: "Wed", revenue: 5100, commission: 510 },
  { day: "Thu", revenue: 4600, commission: 460 },
  { day: "Fri", revenue: 5800, commission: 580 },
  { day: "Sat", revenue: 6200, commission: 620 },
  { day: "Sun", revenue: 4900, commission: 490 },
];

const Income = () => {
  const [walletData, setWalletData] = useState({
    totalRevenue: 124500,
    earnings: 112050,
    commission: 12450,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await getWalletDetails();
      console.log('Wallet Response:', response);

      // Update with real data
      setWalletData({
        totalRevenue: response?.totalRevenue || response?.balance || 124500,
        earnings: response?.earnings || response?.availableBalance || 112050,
        commission: response?.commission || response?.platformFee || 12450,
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Income</h1>
          <p className="text-sm text-muted-foreground">
            Revenue breakdown and earnings
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: "Total Revenue",
              value: `₹${walletData.totalRevenue.toLocaleString()}`,
              icon: <IndianRupee className="w-5 h-5 text-primary-dark" />,
              trend: "+8.2%",
            },
            {
              title: "Your Earnings",
              value: `₹${walletData.earnings.toLocaleString()}`,
              icon: <TrendingUp className="w-5 h-5 text-primary-dark" />,
              trend: "90%",
            },
            {
              title: "GroFast Commission",
              value: `₹${walletData.commission.toLocaleString()}`,
              icon: <ShoppingCart className="w-5 h-5 text-warning" />,
              trend: "10%",
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
                      <span className="inline-block animate-pulse bg-muted h-6 w-24 rounded"></span>
                    ) : (
                      card.value
                    )}
                  </h3>
                  <p className="text-xs text-primary-dark mt-1">
                    {card.trend}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">
              Daily Revenue
            </h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(120,16%,90%)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(0,0%,45%)"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(0,0%,45%)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(120,16%,90%)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(103,56%,71%)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">
              Commission Trend
            </h3>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(120,16%,90%)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(0,0%,45%)"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(0,0%,45%)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(120,16%,90%)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="hsl(38,92%,50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(38,92%,50%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Income;
