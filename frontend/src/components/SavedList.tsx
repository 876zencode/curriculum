import { useQuery } from "@tanstack/react-query"
import { getSavedSources, SourceDTO } from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SavedList() {
  const { data: savedSources, isLoading, error } = useQuery({
    queryKey: ['savedSources'],
    queryFn: getSavedSources
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error fetching saved sources</div>

  return (
    <div className="space-y-4">
      {savedSources?.map((source: SourceDTO) => (
        <Card key={source.url} className="w-full max-w-2xl rounded-2xl">
          <CardHeader>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              <CardTitle>{source.title}</CardTitle>
            </a>
            <CardDescription className="text-green-600">{source.url}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{source.reason}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
