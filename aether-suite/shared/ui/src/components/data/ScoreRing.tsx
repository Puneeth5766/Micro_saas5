import { cn } from "../../utils/cn";

export interface ScoreRingProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score < 40) return "var(--color-danger)";
  if (score < 70) return "var(--color-warning)";
  return "var(--color-success)";
}

export function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score ${clamped}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--color-surface-alt)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(clamped)}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out")}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-current text-xl font-semibold text-text-primary">
          {clamped}
        </text>
      </svg>
    </div>
  );
}
