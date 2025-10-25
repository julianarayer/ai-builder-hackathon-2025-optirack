import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ProfileSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const ProfileSection = ({ 
  title, 
  icon: Icon, 
  children, 
  className 
}: ProfileSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-neutral-900">
        <Icon className="w-5 h-5" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="bg-neutral-50/50 border border-neutral-200 rounded-2xl p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};
