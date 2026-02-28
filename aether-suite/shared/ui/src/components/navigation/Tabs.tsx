"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface TabItem {
  label: string;
  value: string;
  content: ReactNode;
  disabled?: boolean;
}

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        underline: "border-b-2 border-transparent text-text-secondary hover:text-text-primary data-[state=active]:border-primary data-[state=active]:text-primary",
        pill: "rounded-full text-text-secondary hover:bg-surface-alt data-[state=active]:bg-primary data-[state=active]:text-white",
        boxed: "rounded-md border border-border text-text-secondary hover:bg-surface-alt data-[state=active]:border-primary data-[state=active]:text-primary"
      }
    },
    defaultVariants: {
      variant: "underline"
    }
  }
);

export interface TabsProps extends VariantProps<typeof tabsTriggerVariants> {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ items, defaultValue, variant = "underline", className }: TabsProps) {
  const fallbackValue = items[0]?.value;
  const initialValue = defaultValue ?? fallbackValue;

  return (
    <TabsPrimitive.Root defaultValue={initialValue} className={cn("w-full", className)}>
      <TabsPrimitive.List className="mb-4 flex flex-wrap items-center gap-2" aria-label="Tabs">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(tabsTriggerVariants({ variant }))}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} value={item.value} className="outline-none">
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
