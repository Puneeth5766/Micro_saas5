import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

export type StepStatus = "complete" | "current" | "upcoming";

export interface Step {
  label: string;
  status: StepStatus;
}

const stepIndicatorVariants = cva("flex", {
  variants: {
    orientation: {
      horizontal: "flex-wrap items-start gap-3",
      vertical: "flex-col gap-3"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
});

export interface StepIndicatorProps extends VariantProps<typeof stepIndicatorVariants> {
  steps: Step[];
}

function statusClasses(status: StepStatus): string {
  if (status === "complete") {
    return "border-success bg-success text-white";
  }
  if (status === "current") {
    return "border-primary bg-primary text-white";
  }
  return "border-border bg-surface text-text-muted";
}

export function StepIndicator({ steps, orientation = "horizontal" }: StepIndicatorProps) {
  return (
    <ol className={cn(stepIndicatorVariants({ orientation }))} aria-label="Progress steps">
      {steps.map((step, index) => (
        <li key={`${step.label}-${index}`} className={cn("flex items-center gap-2", orientation === "vertical" ? "" : "min-w-36")}> 
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
              statusClasses(step.status)
            )}
            aria-hidden
          >
            {step.status === "complete" ? "✓" : index + 1}
          </span>
          <span className={cn("text-sm", step.status === "upcoming" ? "text-text-muted" : "text-text-primary")}>{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
