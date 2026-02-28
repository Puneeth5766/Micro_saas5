import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover",
        secondary: "bg-secondary text-white hover:brightness-95",
        outline: "border border-border bg-background text-text-primary hover:bg-surface",
        ghost: "bg-transparent text-text-primary hover:bg-surface-alt",
        danger: "bg-danger text-white hover:brightness-95"
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, disabled = false, leftIcon, rightIcon, asChild = false, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={!asChild ? isDisabled : undefined}
        aria-disabled={asChild ? isDisabled : undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Spinner size="sm" color="inherit" aria-label="Button loading" /> : leftIcon}
        <span>{children}</span>
        {!loading ? rightIcon : null}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
