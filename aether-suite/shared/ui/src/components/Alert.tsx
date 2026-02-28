import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

const alertVariants = cva("relative rounded-md border p-4", {
  variants: {
    variant: {
      info: "border-secondary/30 bg-secondary/10 text-text-primary",
      success: "border-success/30 bg-success/10 text-text-primary",
      warning: "border-warning/30 bg-warning/10 text-text-primary",
      error: "border-danger/30 bg-danger/10 text-text-primary"
    }
  },
  defaultVariants: {
    variant: "info"
  }
});

const defaultIcons: Record<NonNullable<AlertProps["variant"]>, string> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  error: "⨯"
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  dismissible?: boolean;
  icon?: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant = "info", title, description, dismissible = false, icon, children, ...props },
    ref
  ) => {
    const [open, setOpen] = useState(true);

    if (!open) {
      return null;
    }

    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        <div className="flex items-start gap-3 pr-8">
          <span aria-hidden className="mt-0.5 text-sm font-semibold">
            {icon ?? defaultIcons[variant]}
          </span>
          <div className="space-y-1">
            {title ? <p className="font-medium text-text-primary">{title}</p> : null}
            {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
            {children}
          </div>
        </div>
        {dismissible ? (
          <button
            type="button"
            aria-label="Dismiss alert"
            className="absolute right-2 top-2 rounded p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text-primary"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        ) : null}
      </div>
    );
  }
);

Alert.displayName = "Alert";
