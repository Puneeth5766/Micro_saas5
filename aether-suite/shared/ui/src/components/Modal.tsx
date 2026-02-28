import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { type PropsWithChildren, type ReactNode } from "react";
import { cn } from "../utils/cn";

const modalContentVariants = cva(
  "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-xl focus:outline-none",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "h-[95vh] max-w-[95vw]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);

export interface ModalProps extends PropsWithChildren, VariantProps<typeof modalContentVariants> {
  open: boolean;
  onClose: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
}

export function Modal({ open, onClose, title, description, size, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px]" />
        <Dialog.Content className={cn(modalContentVariants({ size }))}>
          <div className="mb-4 space-y-1">
            {title ? <Dialog.Title className="text-lg font-semibold text-text-primary">{title}</Dialog.Title> : null}
            {description ? (
              <Dialog.Description className="text-sm text-text-secondary">{description}</Dialog.Description>
            ) : null}
          </div>
          <div>{children}</div>
          <Dialog.Close
            aria-label="Close modal"
            className="absolute right-3 top-3 rounded-md p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text-primary"
          >
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
