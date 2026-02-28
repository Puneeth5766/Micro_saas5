import { cva } from "class-variance-authority";
import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";

const textareaVariants = cva(
  "w-full rounded-md border bg-background px-3 py-2 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-text-muted",
  {
    variants: {
      state: {
        default: "border-border",
        error: "border-danger focus-visible:ring-danger"
      }
    },
    defaultVariants: {
      state: "default"
    }
  }
);

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  autoResize?: boolean;
}

function autoResizeTextarea(target: HTMLTextAreaElement): void {
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, id, label, error, hint, leftIcon, rightIcon, required, disabled, autoResize = false, onInput, ...props },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-primary">
            {label}
            {required ? <span className="ml-1 text-danger">*</span> : null}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute left-3 top-3 text-text-muted">{leftIcon}</span>
          ) : null}
          <textarea
            ref={ref}
            id={textareaId}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              textareaVariants({ state: error ? "error" : "default" }),
              "min-h-24 resize-y",
              autoResize && "resize-none overflow-hidden",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            onInput={(event) => {
              if (autoResize) {
                autoResizeTextarea(event.currentTarget);
              }
              onInput?.(event);
            }}
            {...props}
          />
          {rightIcon ? (
            <span className="pointer-events-none absolute right-3 top-3 text-text-muted">{rightIcon}</span>
          ) : null}
        </div>
        {error ? (
          <p id={errorId} className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-sm text-text-secondary">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
