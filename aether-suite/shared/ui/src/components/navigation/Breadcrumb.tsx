import Link from "next/link";
import { Fragment } from "react";
import { cn } from "../../utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isMiddleOnMobile = index > 0 && !isLast;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className={cn("min-w-0", isMiddleOnMobile && "hidden sm:block")}>
                {item.href && !isLast ? (
                  <Link href={item.href} className="truncate hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn("truncate", isLast && "font-medium text-text-primary")}>{item.label}</span>
                )}
              </li>
              {!isLast ? <li className="text-text-muted">/</li> : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
