"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string): void => {
    sonnerToast.success(message);
  },
  error: (message: string): void => {
    sonnerToast.error(message);
  },
  loading: (message: string): string | number => sonnerToast.loading(message),
  info: (message: string): void => {
    sonnerToast.info(message);
  }
};

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "!border !border-border !bg-surface !text-text-primary",
          description: "!text-text-secondary",
          actionButton: "!bg-primary !text-white",
          cancelButton: "!bg-surface-alt !text-text-primary"
        }
      }}
    />
  );
}
