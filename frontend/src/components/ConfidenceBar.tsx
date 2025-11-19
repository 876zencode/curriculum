import { Progress } from "@/components/ui/progress";

interface ConfidenceBarProps {
  confidence: number;
}

export function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const progressValue = confidence * 100;
  let progressColorClass = "bg-blue-500"; // Default

  if (confidence >= 0.90) {
    progressColorClass = "bg-yellow-500"; // Gold
  } else if (confidence >= 0.75) {
    progressColorClass = "bg-gray-400"; // Silver
  } else if (confidence >= 0.60) {
    progressColorClass = "bg-amber-600"; // Bronze
  } else {
    progressColorClass = "bg-red-500"; // Low confidence
  }

  return (
    <div className="flex items-center space-x-2">
      <Progress value={progressValue} className={`w-[60%] [&::-webkit-progress-value]:${progressColorClass}`} />
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {(confidence * 100).toFixed(1)}%
      </span>
    </div>
  );
}
