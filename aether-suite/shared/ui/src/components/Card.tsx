import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

const cardVariants = cva("rounded-lg bg-surface text-text-primary", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-8"
    },
    shadow: {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl"
    },
    border: {
      true: "border border-border",
      false: "border-transparent"
    },
    hoverable: {
      true: "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg",
      false: ""
    }
  },
  defaultVariants: {
    padding: "md",
    shadow: "sm",
    border: true,
    hoverable: false
  }
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, shadow, border, hoverable, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ padding, shadow, border, hoverable }), className)} {...props} />
  )
);
CardRoot.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-3 flex flex-col gap-1", className)} {...props} />
));
CardHeader.displayName = "Card.Header";

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-text-secondary", className)} {...props} />
));
CardBody.displayName = "Card.Body";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-4 flex items-center justify-end gap-2", className)} {...props} />
));
CardFooter.displayName = "Card.Footer";

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter
});
