import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  label?: string;
}

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1.5", className)} data-ocid="progress-bar">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-mono text-primary tabular-nums">
            {clamped.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        />
      </div>
    </div>
  );
}
