/**
 * MetricCard Component
 * Display KPI metrics with icon, value, and trend
 */

import { cn } from "@/lib/utils";
import { MetricCardProps } from "@/types";
import { GlassCard } from "./glass-card";
import { Badge } from "./badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export const MetricCard = ({
  icon: Icon,
  title,
  value,
  changePercent,
  trend,
  className,
}: MetricCardProps) => {
  const isPositive = trend === 'up';
  const showChange = changePercent !== undefined;

  return (
    <GlassCard hover className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100">
            <Icon className="h-6 w-6 text-primary-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-subtle">{title}</span>
            <span className="text-3xl font-medium text-neutral-900 kpi-value">{value}</span>
          </div>
        </div>
        {showChange && (
          <Badge 
            variant={isPositive ? 'success' : 'error'} 
            className="flex items-center gap-1"
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(changePercent!)}%
          </Badge>
        )}
      </div>
    </GlassCard>
  );
};
