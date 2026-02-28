import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type ReactNode } from "react";
import { cn } from "../utils/cn";

export type DropdownItem = {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
};

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "start" | "center" | "end";
}

export function Dropdown({ trigger, items, align = "end" }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          className="z-50 min-w-44 rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          {items.map((item, index) => {
            if (item.separator) {
              return <DropdownMenu.Separator key={`sep-${index}`} className="my-1 h-px bg-border" />;
            }

            return (
              <DropdownMenu.Item
                key={`${item.label ?? "item"}-${index}`}
                disabled={item.disabled}
                onSelect={(event) => {
                  event.preventDefault();
                  if (!item.disabled) {
                    item.onClick?.();
                  }
                }}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm outline-none transition-colors",
                  "focus:bg-surface-alt data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                  item.destructive ? "text-danger" : "text-text-primary"
                )}
              >
                {item.icon ? <span className="text-current">{item.icon}</span> : null}
                <span>{item.label}</span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
