import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressStepper = ({ 
  currentStep, 
  totalSteps, 
  stepLabels 
}: ProgressStepperProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-neutral-200 rounded-full" 
             style={{ marginLeft: '2rem', marginRight: '2rem' }} />
        
        {/* Active progress bar */}
        <div 
          className="absolute top-5 left-0 h-1 bg-primary-400 rounded-full transition-all duration-500"
          style={{ 
            marginLeft: '2rem',
            width: `calc(${((currentStep - 1) / (totalSteps - 1)) * 100}% - 4rem)`
          }}
        />
        
        {/* Steps */}
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-col items-center gap-2 relative z-10">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-smooth",
              step < currentStep 
                ? "bg-primary-400 text-white shadow-lg" 
                : step === currentStep
                ? "bg-primary-500 text-white shadow-lg scale-110"
                : "bg-white border-2 border-neutral-200 text-neutral-400"
            )}>
              {step < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step
              )}
            </div>
            <span className={cn(
              "text-xs font-medium transition-smooth whitespace-nowrap",
              step <= currentStep ? "text-neutral-900" : "text-neutral-400"
            )}>
              {stepLabels[step - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
