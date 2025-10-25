import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface RadioCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export const RadioCard = ({ 
  icon: Icon, 
  title, 
  description, 
  selected, 
  onClick 
}: RadioCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass-card p-6 rounded-3xl transition-smooth cursor-pointer text-left w-full",
        "border-2 hover:scale-[1.02] active:scale-[0.98]",
        selected 
          ? "border-primary-400 bg-primary-50/50 shadow-lg" 
          : "border-primary-200/30 hover:border-primary-300"
      )}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className={cn(
          "flex items-center justify-center w-16 h-16 rounded-2xl transition-smooth",
          selected ? "bg-primary-200" : "bg-neutral-100"
        )}>
          <Icon className={cn(
            "w-8 h-8",
            selected ? "text-primary-600" : "text-neutral-600"
          )} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
    </button>
  );
};
