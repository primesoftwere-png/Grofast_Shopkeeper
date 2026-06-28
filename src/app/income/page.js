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

  // Date filter states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    fetchIncomeData();
  }, [startDate, endDate]);

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      const queryString = queryParams.toString();

      const [overviewRes, dailyRes] = await Promise.all([
        getIncomeOverview(queryString),
        getDailyIncome(queryString)
      ]);

      if (overviewRes?.data?.data) {
        const overview = overviewRes.data.data;
        const customPeriod = overview.customPeriod || {};
        const allTime = overview.allTime || {};
        
        // Use customPeriod if available, else fallback
        const totalEarnings = (startDate && endDate) ? customPeriod.netIncome || customPeriod.totalIncome || 0 
          : allTime.totalEarnings || overview.totalEarnings || 0;
        const totalCommission = (startDate && endDate) ? customPeriod.platformCommission || 0 
          : allTime.totalPlatformCommission || overview.totalCommission || 0;
        const totalRevenue = (startDate && endDate) ? customPeriod.totalIncome || totalEarnings + totalCommission 
          : allTime.totalEarnings ? totalEarnings + totalCommission : (overview.totalRevenue || 0);

        setOverviewData({
          totalRevenue,
          totalEarnings,
          totalCommission,
        });
      }

      if (dailyRes?.data?.data) {
        // Format daily data for charts
        const formattedData = dailyRes.data.data.map(item => {
          const date = new Date(item.date || item.createdAt || new Date());
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: item.totalRevenue || item.totalIncome || item.netIncome || item.totalEarnings || 0,
            commission: item.totalCommission || item.platformCommission || 0
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Income</h1>
            <p className="text-sm text-muted-foreground">
              Revenue breakdown and earnings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: "Total Revenue",
              value: `₹${overviewData.totalRevenue.toLocaleString()}`,
              icon: <IndianRupee className="w-5 h-5 text-primary-dark" />,
              trend: "Period",
            },
            {
              title: "Your Earnings",
              value: `₹${overviewData.totalEarnings.toLocaleString()}`,
              icon: <TrendingUp className="w-5 h-5 text-primary-dark" />,
              trend: "Period",
            },
            {
              title: "GroFast Commission",
              value: `₹${overviewData.totalCommission.toLocaleString()}`,
              icon: <ShoppingCart className="w-5 h-5 text-warning" />,
              trend: "Period",
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
