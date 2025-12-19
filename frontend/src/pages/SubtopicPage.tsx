import { Link, useLocation, useParams } from "react-router-dom";
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

const typePalette: Record<string, { badge: string; accent: string; pill: string }> = {
  video: {
    badge: "bg-white/20 text-white border border-white/25",
    accent: "from-sky-500/20 to-sky-400/10",
    pill: "bg-white/85 text-slate-900 border-white/60",
  },
  documentation: {
    badge: "bg-white/20 text-white border border-white/25",
    accent: "from-green-500/20 to-green-400/10",
    pill: "bg-white/85 text-slate-900 border-white/60",
  },
  article: {
    badge: "bg-white/20 text-white border border-white/25",
    accent: "from-gray-500/18 to-gray-400/8",
    pill: "bg-white/85 text-slate-900 border-white/60",
  },
  tutorial: {
    badge: "bg-white/20 text-white border border-white/25",
    accent: "from-yellow-500/20 to-yellow-400/10",
    pill: "bg-white/85 text-slate-900 border-white/60",
  },
  github: {
    badge: "bg-white/20 text-white border border-white/25",
    accent: "from-slate-500/18 to-slate-400/10",
    pill: "bg-white/85 text-slate-900 border-white/60",
  },
  book: {
    badge: "bg-white/20 text-white border border-white/25",
    accent: "from-orange-500/18 to-orange-400/10",
    pill: "bg-white/85 text-slate-900 border-white/60",
  },
};

const getTypeStyles = (type: string) => {
  const normalized = (type || "").toLowerCase();
  return (
    typePalette[normalized] || {
      badge: "bg-white/20 text-white border border-white/25",
      accent: "from-primary/15 to-primary/5",
      pill: "bg-white/85 text-slate-900 border-white/60",
    }
  );
};

export function SubtopicPage() {
  const { slug, topicId = "", subtopicId = "" } = useParams<{ slug: string; topicId: string; subtopicId: string }>();
  const location = useLocation();
  const navState = (location.state as { returnOpenTopics?: string[]; returnFocusedTopicId?: string | null } | null) || null;

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
        <Link
          to={parentTopic ? `/language/${slug}` : "/"}
          state={
            parentTopic && navState
              ? {
                  returnOpenTopics: navState.returnOpenTopics,
                  returnFocusedTopicId: navState.returnFocusedTopicId,
                }
              : undefined
          }
        >
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
            <Link
              to={`/language/${slug}`}
              state={
                navState
                  ? {
                      returnOpenTopics: navState.returnOpenTopics,
                      returnFocusedTopicId: navState.returnFocusedTopicId,
                    }
                  : undefined
              }
            >
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
              {parentTopic && <Badge className="bg-white/15 text-white border border-white/25">From: {parentTopic.title}</Badge>}
              {subtopic.estimated_hours > 0 && (
                <Badge className="bg-white/15 text-white border border-white/25">{subtopic.estimated_hours} hrs</Badge>
              )}
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
            <Card className="md:col-span-2 border-primary/30 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Learning material
                </CardTitle>
                <CardDescription>Curated assets for this subtopic.</CardDescription>
              </CardHeader>
              <CardContent>
                {subtopic.learning_resources?.length ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {subtopic.learning_resources.map((res: LearningResourceDTO, idx) => {
                      const styles = getTypeStyles(res.type || "");
                      return (
                        <div
                          key={idx}
                          className={`relative overflow-hidden rounded-xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${styles.accent} bg-gradient-to-br`}
                        >
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-40" />
                            <div className="flex flex-col gap-2 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <CardTitle className="text-sm leading-tight">{res.title}</CardTitle>
                                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold border shadow-sm ${styles.pill}`}>
                                  {res.type || "Resource"}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-3">{res.short_summary}</p>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                            >
                              Visit resource <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
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
