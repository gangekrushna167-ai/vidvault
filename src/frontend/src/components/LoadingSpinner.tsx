import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  message,
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      data-ocid="loading-spinner"
    >
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
