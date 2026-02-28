import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-full font-medium", {
  variants: {
    variant: {
      default: "bg-surface-alt text-text-primary",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      danger: "bg-danger/10 text-danger",
      info: "bg-secondary/10 text-secondary",
      outline: "border border-border bg-transparent text-text-primary"
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, size, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
));

Badge.displayName = "Badge";

export { badgeVariants };
