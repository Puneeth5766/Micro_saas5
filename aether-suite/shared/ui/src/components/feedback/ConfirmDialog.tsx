"use client";

import { useState } from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  variant?: "default" | "danger";
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default"
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm(): Promise<void> {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onClose(false)} disabled={submitting}>
          {cancelLabel}
        </Button>
        <Button variant={variant === "danger" ? "danger" : "primary"} onClick={handleConfirm} loading={submitting}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
