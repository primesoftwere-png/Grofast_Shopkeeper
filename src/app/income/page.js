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

import { getIncomeOverview, getDailyIncome } from "@/services/incomeService";

const Income = () => {
  const [overviewData, setOverviewData] = useState({
    totalRevenue: 0,
    totalEarnings: 0,
    totalCommission: 0,
  });
  const [dailyData, setDailyData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncomeData();
  }, []);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const [overviewRes, dailyRes] = await Promise.all([
        getIncomeOverview(),
        getDailyIncome('days=7')
      ]);

      if (overviewRes?.data) {
        setOverviewData({
          totalRevenue: overviewRes.data.totalRevenue || 0,
          totalEarnings: overviewRes.data.totalEarnings || 0,
          totalCommission: overviewRes.data.totalCommission || 0,
        });
      }

      if (dailyRes?.data?.data) {
        // Format daily data for charts
        const formattedData = dailyRes.data.data.map(item => {
          const date = new Date(item.date);
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: item.totalRevenue,
            commission: item.totalCommission
          };
        });
        setDailyData(formattedData.reverse()); // Show oldest to newest left to right
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
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
              value: `₹${overviewData.totalRevenue.toLocaleString()}`,
              icon: <IndianRupee className="w-5 h-5 text-primary-dark" />,
              trend: "Overall",
            },
            {
              title: "Your Earnings",
              value: `₹${overviewData.totalEarnings.toLocaleString()}`,
              icon: <TrendingUp className="w-5 h-5 text-primary-dark" />,
              trend: "Overall",
            },
            {
              title: "GroFast Commission",
              value: `₹${overviewData.totalCommission.toLocaleString()}`,
              icon: <ShoppingCart className="w-5 h-5 text-warning" />,
              trend: "Overall",
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
