import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

type SpinnerColor =
  | "inherit"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "muted";

const spinnerVariants = cva("inline-block animate-spin rounded-full border-current border-t-transparent", {
  variants: {
    size: {
      sm: "h-3 w-3 border-2",
      md: "h-4 w-4 border-2",
      lg: "h-6 w-6 border-2",
      xl: "h-8 w-8 border-[3px]"
    },
    color: {
      inherit: "text-inherit",
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      muted: "text-text-muted"
    }
  },
  defaultVariants: {
    size: "md",
    color: "inherit"
  }
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  "aria-label"?: string;
}

export function Spinner({ className, size, color, "aria-label": ariaLabel = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn(spinnerVariants({ size, color }), className)}
    />
  );
}

export type { SpinnerColor };
