"use client";

import React from "react";
import { motion } from "framer-motion";

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-2xl p-5 shadow-card border border-border/50 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>

        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
              trendUp
                ? "bg-primary/10 text-primary-dark"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-foreground">
        {value}
      </p>

      <p className="text-sm text-muted-foreground mt-0.5">
        {title}
      </p>
    </motion.div>
  );
};

export { StatCard };