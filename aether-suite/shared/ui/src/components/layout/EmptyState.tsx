import type { ReactNode } from "react";
import { Button } from "../Button";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface p-10 text-center">
      {icon ? <div className="mb-4 text-3xl text-text-muted">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-2 max-w-xl text-sm text-text-secondary">{description}</p>
      {action ? (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      ) : null}
    </div>
  );
}
