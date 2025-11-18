import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SourceDTO } from "@/lib/api"

interface SourceResultCardProps {
  source: SourceDTO;
  onSave: (source: SourceDTO) => void;
}

export function SourceResultCard({ source, onSave }: SourceResultCardProps) {
  return (
    <Card className="w-full max-w-2xl rounded-2xl">
      <CardHeader>
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          <CardTitle>{source.title}</CardTitle>
        </a>
        <CardDescription className="text-green-600">{source.url}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{source.reason}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge>Authority Score: {source.authorityScore}</Badge>
        <Button onClick={() => onSave(source)}>Save Link</Button>
      </CardFooter>
    </Card>
  )
}
