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
  variant = 'default',
}: MetricCardProps & { variant?: 'default' | 'pink' | 'blue' | 'purple' | 'green' }) => {
  const isPositive = trend === 'up';
  const showChange = changePercent !== undefined;

  const variantStyles = {
    default: {
      card: "bg-gradient-to-br from-neutral-50 to-white",
      iconBg: "bg-gradient-to-br from-primary-100 to-primary-200",
      iconColor: "text-primary-600",
      value: "text-neutral-900"
    },
    pink: {
      card: "bg-gradient-to-br from-pink-50 via-pink-50/50 to-white",
      iconBg: "bg-gradient-to-br from-pink-400 to-pink-500 shadow-lg shadow-pink-200",
      iconColor: "text-white",
      value: "text-pink-600"
    },
    blue: {
      card: "bg-gradient-to-br from-blue-50 via-blue-50/50 to-white",
      iconBg: "bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-200",
      iconColor: "text-white",
      value: "text-blue-600"
    },
    purple: {
      card: "bg-gradient-to-br from-purple-50 via-purple-50/50 to-white",
      iconBg: "bg-gradient-to-br from-purple-400 to-purple-500 shadow-lg shadow-purple-200",
      iconColor: "text-white",
      value: "text-purple-600"
    },
    green: {
      card: "bg-gradient-to-br from-green-50 via-green-50/50 to-white",
      iconBg: "bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-200",
      iconColor: "text-white",
      value: "text-green-600"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "rounded-3xl p-6 border border-neutral-200/50 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-neutral-300",
      styles.card,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", styles.iconBg)}>
            <Icon className={cn("h-7 w-7", styles.iconColor)} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-neutral-600">{title}</span>
            <span className={cn("text-3xl font-bold kpi-value", styles.value)}>{value}</span>
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
    </div>
  );
};
