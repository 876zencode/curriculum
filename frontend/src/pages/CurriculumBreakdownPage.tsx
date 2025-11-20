import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSourceBreakdown, SourceBreakdownDTO, TopicDTO, SourceReferenceDTO } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function CurriculumBreakdownPage() {
  const { slug, sourceId } = useParams<{ slug: string; sourceId: string }>();

  const { data: sourceBreakdown, isLoading, isError, error } = useQuery<SourceBreakdownDTO, Error>({
    queryKey: ["sourceBreakdown", slug, sourceId],
    queryFn: () => getSourceBreakdown(slug!, sourceId!),
    enabled: !!slug && !!sourceId,
  });

  if (isError) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load source breakdown: {error?.message}</p>
        <Link to={`/language/${slug}`}>
          <Button variant="link" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Curriculum</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !sourceBreakdown) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Skeleton className="h-10 w-1/4 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  // Helper to render topics recursively
  const renderTopics = (topics: TopicDTO[], level: number = 0) => {
    return topics.map((topic) => (
      <AccordionItem value={topic.id} key={topic.id}>
        <AccordionTrigger className={`text-left ${level === 0 ? 'font-semibold text-base' : 'text-sm'}`}>
          <div className="flex justify-between items-center w-full pr-4">
            <span>{topic.order}. {topic.title}</span>
            {topic.estimated_hours > 0 && (
              <Badge variant="outline" className="ml-2 whitespace-nowrap">{topic.estimated_hours} hrs</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pl-4">
          <p className="text-sm text-muted-foreground mb-2">{topic.description}</p>
          {topic.outcomes && topic.outcomes.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-xs text-muted-foreground">Outcomes: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.outcomes.map((outcome, idx) => <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-xs">{outcome}</Badge>)}
              </div>
            </div>
          )}
           {topic.example_exercises && topic.example_exercises.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-xs text-muted-foreground">Exercises: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.example_exercises.map((exercise, idx) => <Badge key={idx} variant="outline" className="px-2 py-0.5 text-xs">{exercise}</Badge>)}
              </div>
            </div>
          )}
          {topic.helpful_references && topic.helpful_references.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-xs text-muted-foreground">References: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.helpful_references.map((ref: SourceReferenceDTO, idx: number) => (
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" key={idx} className="flex items-center text-blue-500 hover:underline text-xs">
                        {ref.sourceId} <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                ))}
              </div>
            </div>
          )}
          {topic.explainability && topic.explainability.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-xs text-muted-foreground">Why this topic? </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.explainability.map((explanation, idx) => <Badge key={idx} variant="outline" className="px-2 py-0.5 text-xs">{explanation}</Badge>)}
              </div>
            </div>
          )}
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div className="pl-4 border-l ml-2 mt-2">
              <Accordion type="multiple" className="w-full">
                {renderTopics(topic.subtopics, level + 1)}
              </Accordion>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    ));
  };


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link to={`/language/${slug}`}>
        <Button variant="link" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to {slug} Curriculum</Button>
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">
            <a href={sourceBreakdown.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {sourceBreakdown.title}
            </a>
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Source ID: {sourceBreakdown.sourceId} - {sourceBreakdown.url}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-md mb-4">{sourceBreakdown.summary}</p>
        </CardContent>
      </Card>

      {sourceBreakdown.extracted_topics && sourceBreakdown.extracted_topics.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Extracted Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {renderTopics(sourceBreakdown.extracted_topics)}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {sourceBreakdown.references && sourceBreakdown.references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Internal References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sourceBreakdown.references.map((ref, idx) => (
                <a href={ref.url} target="_blank" rel="noopener noreferrer" key={idx} className="flex items-center text-blue-500 hover:underline text-sm">
                  {ref.sourceId} - {ref.short_evidence || ref.snippet?.substring(0, 50) + "..."} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}