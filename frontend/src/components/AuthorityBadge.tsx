import { Badge } from "@/components/ui/badge";

interface AuthorityBadgeProps {
  confidence: number;
}

export function AuthorityBadge({ confidence }: AuthorityBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" | null | undefined = "outline"; // Default to outline
  let text = "Unranked";
  let textColor = "text-gray-500"; // Default color

  if (confidence >= 0.90) {
    variant = "default"; // Gold-like, adjust in index.css if needed
    text = "Gold Authority";
    textColor = "text-yellow-600 dark:text-yellow-400";
  } else if (confidence >= 0.75) {
    variant = "secondary"; // Silver-like, adjust in index.css if needed
    text = "Silver Authority";
    textColor = "text-gray-500 dark:text-gray-300";
  } else if (confidence >= 0.60) {
    variant = "destructive"; // Bronze-like, adjust in index.css if needed
    text = "Bronze Authority";
    textColor = "text-amber-700 dark:text-amber-500";
  } else {
    // For confidence < 0.60 or invalid confidence
    variant = "outline";
    text = "Low Confidence";
    textColor = "text-red-500 dark:text-red-400";
  }

  return (
    <Badge variant={variant} className={`font-semibold ${textColor}`}>
      {text} ({ (confidence * 100).toFixed(0)}%)
    </Badge>
  );
}