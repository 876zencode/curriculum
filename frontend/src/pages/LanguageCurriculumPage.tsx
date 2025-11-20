import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLanguageOverview, LanguageOverviewResponse, LearningLevelDTO, TopicDTO, PracticeProjectDTO } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CanonicalSourcesGroup } from "@/components/CanonicalSourcesGroup"; // Will create next
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton"; // Need to create this if it doesn't exist
import { Progress } from "@/components/ui/progress"; // Need this for overall progress/time

export function LanguageCurriculumPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError, error } = useQuery<LanguageOverviewResponse, Error>({
    queryKey: ["languageOverview", slug],
    queryFn: () => getLanguageOverview(slug!),
    enabled: !!slug,
  });

  if (isError) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load curriculum: {error?.message}</p>
        <Link to="/">
          <Button variant="link" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Languages</Button>
        </Link>
      </div>
    );
  }

  const consolidatedSources = data?.consolidatedSources;
  const curriculum = data?.curriculum;

  // Render topics recursively for the curriculum overview
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
                {topic.helpful_references.map((ref, idx) => (
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" key={idx} className="flex items-center text-blue-500 hover:underline text-xs">
                        {ref.sourceId} <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                ))}
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
    <div className="container mx-auto p-4 max-w-5xl">
      <Link to="/">
        <Button variant="link" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Languages</Button>
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-extrabold mb-2">{consolidatedSources?.headline || "Loading..."}</h1>
          <p className="text-md text-muted-foreground mb-6">
            {curriculum?.explanation || "Loading AI-generated narrative..."}
          </p>

          <Separator className="my-6" />

          {/* Canonical Sources Group */}
          {consolidatedSources?.sources && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Canonical Sources</h2>
              <CanonicalSourcesGroup sources={consolidatedSources.sources} languageSlug={slug!} />
            </div>
          )}

          <Separator className="my-6" />

          {/* Overall Learning Path */}
          {curriculum?.overall_learning_path && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Overall Learning Path</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Structured path from Beginner to Expert, with estimated hours per level and key topics.
                (Generated by {curriculum.model_version} at {new Date(curriculum.generated_at).toLocaleString()})
              </p>

              <div className="space-y-6">
                {curriculum.overall_learning_path.map((levelData: LearningLevelDTO) => (
                  <Card key={levelData.level}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{levelData.level}</span>
                        <Badge className="bg-blue-500 text-white">{levelData.estimated_hours} hrs est.</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="multiple" className="w-full">
                        {renderTopics(levelData.topics)}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations (Optional) */}
          {curriculum && (curriculum.core_sources?.length > 0 || curriculum.supplemental_sources?.length > 0 || curriculum.practice_projects?.length > 0) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
              {curriculum.core_sources && curriculum.core_sources.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Core Sources:</h3>
                  <div className="flex flex-wrap gap-2">
                    {/* These are just source IDs, link them to the actual sources if possible */}
                    {curriculum.core_sources.map((sourceId: string) => (
                      <Badge key={sourceId} variant="default">{sourceId}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {curriculum.supplemental_sources && curriculum.supplemental_sources.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Supplemental Sources:</h3>
                  <div className="flex flex-wrap gap-2">
                    {curriculum.supplemental_sources.map((sourceId: string) => (
                      <Badge key={sourceId} variant="secondary">{sourceId}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {curriculum.practice_projects && curriculum.practice_projects.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Practice Projects:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {curriculum.practice_projects.map((project: PracticeProjectDTO) => (
                      <Card key={project.title}>
                        <CardHeader>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription className="flex justify-between items-center">
                            <span>{project.difficulty}</span>
                            <Badge variant="secondary">{project.estimated_hours} hrs</Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                          {project.outcomes && project.outcomes.length > 0 && (
                            <div>
                              <span className="font-medium text-xs text-muted-foreground">Outcomes: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.outcomes.map((outcome, idx) => <Badge key={idx} variant="outline" className="px-2 py-0.5 text-xs">{outcome}</Badge>)}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}