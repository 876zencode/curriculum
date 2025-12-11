import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Dumbbell, ExternalLink } from "lucide-react";
import { getCurriculum } from "@/lib/api";
import type { CurriculumDTO, LearningResourceDTO, TopicDTO } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type FoundSubtopic = {
  topic: TopicDTO;
  subtopic: TopicDTO;
};

function findSubtopic(curriculum: CurriculumDTO | undefined, topicId: string, subtopicId: string): FoundSubtopic | null {
  if (!curriculum) return null;

  const walk = (topic: TopicDTO): FoundSubtopic | null => {
    if (topic.id === subtopicId) {
      return { topic, subtopic: topic };
    }
    for (const sub of topic.subtopics ?? []) {
      if (sub.id === subtopicId) {
        return { topic, subtopic: sub };
      }
      const nested = walk(sub);
      if (nested) return nested;
    }
    return null;
  };

  for (const level of curriculum.overall_learning_path ?? []) {
    for (const topic of level.topics ?? []) {
      if (topic.id === topicId) {
        const direct = walk(topic);
        if (direct) return { topic, subtopic: direct.subtopic };
      }
      const nested = walk(topic);
      if (nested) return nested;
    }
  }

  return null;
}

const getIconForResourceType = (type: string) => {
  const normalized = (type || "").toLowerCase();
  if (normalized === "video") return "🎥";
  if (normalized === "documentation" || normalized === "article" || normalized === "tutorial") return "📄";
  if (normalized === "github") return "🐙";
  if (normalized === "book") return "📚";
  return "🌐";
};

export function SubtopicPage() {
  const { slug, topicId = "", subtopicId = "" } = useParams<{ slug: string; topicId: string; subtopicId: string }>();

  const { data: curriculum, isLoading, isError } = useQuery<CurriculumDTO, Error>({
    queryKey: ["curriculum", slug],
    queryFn: () => getCurriculum(slug!),
    enabled: !!slug,
  });

  const found = !isLoading && !isError && curriculum ? findSubtopic(curriculum, topicId, subtopicId) : null;
  const subtopic = found?.subtopic;
  const parentTopic = found?.topic;

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      <div className="flex items-center gap-2">
        <Link to={parentTopic ? `/language/${slug}` : "/"}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {parentTopic ? "Back to curriculum" : "Home"}
          </Button>
        </Link>
        {parentTopic && (
          <Badge variant="outline" className="ml-2">
            {parentTopic.title}
          </Badge>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      )}

      {!isLoading && (isError || !subtopic) && (
        <Card>
          <CardHeader>
            <CardTitle>Subtopic not found</CardTitle>
            <CardDescription>We couldn&apos;t locate this subtopic in the curriculum.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to={`/language/${slug}`}>
              <Button variant="link">Back to curriculum</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && subtopic && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{subtopic.title}</h1>
            <p className="text-muted-foreground">{subtopic.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {parentTopic && <Badge variant="secondary">From: {parentTopic.title}</Badge>}
              {subtopic.estimated_hours > 0 && <Badge>{subtopic.estimated_hours} hrs</Badge>}
            </div>
          </div>

          {subtopic.outcomes?.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outcomes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {subtopic.outcomes.map((o, idx) => {
                  const title = typeof o === "string" ? o : o.title || o.description || "";
                  const description = typeof o === "string" ? "" : o.description;
                  const success = typeof o === "string" ? "" : o.success_criteria;
                  return (
                    <div key={idx} className="rounded-md border p-2 text-sm">
                      <p className="font-semibold">{title}</p>
                      {description && <p className="text-muted-foreground text-xs mt-1">{description}</p>}
                      {success && <p className="text-[11px] mt-1 text-emerald-600">Success: {success}</p>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Learning material
                </CardTitle>
                <CardDescription>Curated assets for this subtopic.</CardDescription>
              </CardHeader>
              <CardContent>
                {subtopic.learning_resources?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subtopic.learning_resources.map((res: LearningResourceDTO, idx) => (
                      <Card key={idx} className="border shadow-sm hover:shadow-md transition">
                        <CardHeader className="space-y-1">
                          <div className="flex justify-between items-center gap-2">
                            <CardTitle className="text-sm leading-tight">{res.title}</CardTitle>
                            <Badge variant="secondary" className="text-[11px]">
                              {getIconForResourceType(res.type)} {res.type}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs line-clamp-2">{res.short_summary}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary hover:underline">
                            Open resource <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No curated resources yet for this subtopic.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-indigo-500" />
                  Exercises
                </CardTitle>
                <CardDescription>Practice ideas tied to this subtopic.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(subtopic.example_exercises ?? []).length > 0 ? (
                  subtopic.example_exercises.map((ex, idx) => (
                    <div key={idx} className="rounded-md border bg-muted/40 p-2 text-xs">
                      {ex}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No exercises listed yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
