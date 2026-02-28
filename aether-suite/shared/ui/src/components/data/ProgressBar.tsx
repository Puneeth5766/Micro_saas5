import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const containerVariants = cva("space-y-1.5", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: ""
    }
  },
  defaultVariants: {
    size: "md"
  }
});

const barVariants = cva("transition-colors", {
  variants: {
    color: {
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
      secondary: "text-secondary"
    },
    animated: {
      true: "animate-pulse",
      false: ""
    }
  },
  defaultVariants: {
    color: "primary",
    animated: false
  }
});

const svgHeightBySize: Record<NonNullable<ProgressBarProps["size"]>, number> = {
  sm: 6,
  md: 10,
  lg: 14
};

export interface ProgressBarProps extends VariantProps<typeof containerVariants>, VariantProps<typeof barVariants> {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label, size = "md", color, animated }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const height = svgHeightBySize[size];

  return (
    <div className={cn(containerVariants({ size }))}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      ) : null}
      <div role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <svg viewBox={`0 0 100 ${height}`} className={cn("w-full", barVariants({ color, animated }))} aria-hidden>
          <rect x="0" y="0" width="100" height={height} rx={height / 2} className="fill-surface-alt" />
          <rect x="0" y="0" width={clamped} height={height} rx={height / 2} className="fill-current" />
        </svg>
      </div>
    </div>
  );
}
