/**
 * GlassCard Component
 * Apple-style glassmorphism card with hover effects
 */

import { cn } from "@/lib/utils";
import { GlassCardProps } from "@/types";

export const GlassCard = ({ 
  children, 
  className, 
  hover = false,
  onClick,
  style 
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-3xl p-6 transition-smooth",
        hover && "glass-card-hover cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};
