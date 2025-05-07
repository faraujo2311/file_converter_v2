
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: string[];
  onStepClick?: (step: number) => void; // Optional: allow clicking on steps
  completedSteps?: number[]; // Optional: to show checkmarks for completed steps
}

export function Stepper({ currentStep, steps, onStepClick, completedSteps = [] }: StepperProps) {
  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 bg-card p-2 rounded-lg shadow-md max-w-2xl mx-auto">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
        const isClickable = onStepClick && (isCompleted || stepNumber === currentStep); // Allow clicking completed or current steps

        return (
          <button
            key={stepNumber}
            onClick={() => isClickable && onStepClick(stepNumber)}
            disabled={!isClickable && !isActive} // Disable if not clickable and not active
            className={cn(
              "flex-1 text-center px-3 py-3 sm:px-4 sm:py-3 rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "text-xs sm:text-sm font-medium",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : isCompleted
                ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground opacity-70 cursor-not-allowed",
              isClickable && !isActive && "cursor-pointer"
            )}
            aria-current={isActive ? "step" : undefined}
          >
            <div className="flex items-center justify-center">
              {isCompleted && !isActive && <Check className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />}
              <span className="truncate">{`${stepNumber}. ${label}`}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
