import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface PageContainerProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ title, description, actions, children, className }: PageContainerProps) {
  return (
    <section className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)}>
      {(title || description || actions) ? (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title ? <h1 className="text-2xl font-semibold text-text-primary">{title}</h1> : null}
            {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
