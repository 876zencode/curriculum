import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AssetScoringConfig,
  CurriculumDTO,
  LearningLevelDTO,
  TopicDTO,
  GeneratedAssetDTO,
} from "@/lib/types";
import { getGeneratedAssetForTopic } from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Eye, EyeOff, Sparkles, CheckCircle2, Dumbbell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TopicQuizDialog } from "./TopicQuiz";
import { normalizeLanguageKey } from "@/lib/curriculumEngine";

// Calculate estimated hours recursively for topics and levels
const getTopicHours = (topic: TopicDTO): number => {
  const selfHours = Number(topic.estimated_hours ?? 0);
  const subHours = (topic.subtopics ?? []).reduce((sum, sub) => sum + getTopicHours(sub), 0);
  if (selfHours > 0 && subHours > 0) return selfHours; // assume provided hours already account for subtopics
  if (subHours > 0) return subHours;
  return selfHours;
};

const getLevelHours = (levelData: LearningLevelDTO): number => {
  const computed = (levelData.topics ?? []).reduce((sum, topic) => sum + getTopicHours(topic), 0);
  const provided = Number(levelData.estimated_hours ?? 0);
  if (computed > 0) return computed;
  return provided > 0 ? provided : 0;
};

const formatHours = (hours: number): string => {
  if (!Number.isFinite(hours)) return "0";
  return hours % 1 === 0 ? String(hours) : hours.toFixed(1);
};

type SubtopicCard = {
  id: string;
  label: string;
  preview: string;
  order?: number;
};

const buildSubtopics = (topic: TopicDTO): SubtopicCard[] => {
  if (topic.subtopics && topic.subtopics.length > 0) {
    return topic.subtopics.map((sub, idx) => ({
      id: sub.id || `${topic.id}-sub-${idx}`,
      label: sub.title || `Subtopic ${idx + 1}`,
      preview: sub.description || sub.title || "",
      order: typeof sub.order === "number" ? sub.order : idx + 1,
    }));
  }

  const outcomes = topic.outcomes ?? [];
  return outcomes.map((outcome: any, idx: number) => {
    const label = typeof outcome === "string" ? outcome : outcome?.title || outcome?.description || `Subtopic ${idx + 1}`;
    const previewSource = typeof outcome === "string" ? outcome : outcome?.description || outcome?.title || label;
    const preview = previewSource.length > 200 ? `${previewSource.slice(0, 197)}...` : previewSource;
    return {
      id: (typeof outcome === "object" && outcome?.id) || `${topic.id}-outcome-${idx}`,
      label,
      preview,
      order: idx + 1,
    };
  });
};

const sortSubtopics = (subs: SubtopicCard[]) =>
  [...subs].sort((a, b) => {
    const aOrder = typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
    const bOrder = typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.label.localeCompare(b.label);
  });

function TopicItem({
  topic,
  curriculum,
  level = 0,
  languageSlug,
  focusedTopicId,
  setFocusedTopicId,
  openTopics,
  setOpenTopics,
}: {
  topic: TopicDTO;
  curriculum: CurriculumDTO;
  level?: number;
  languageSlug: string;
  focusedTopicId?: string | null;
  setFocusedTopicId: (id: string | null) => void;
  openTopics: string[];
  setOpenTopics: (ids: string[]) => void;
}) {
  const normalizedLanguageSlug = normalizeLanguageKey(languageSlug || "");
  const [showSummary, setShowSummary] = useState(true);
  const summaryQuery = useQuery<GeneratedAssetDTO, Error>({
    queryKey: ["summary", normalizedLanguageSlug, topic.id],
    queryFn: () => getGeneratedAssetForTopic(normalizedLanguageSlug, topic.id, "summary_article"),
    staleTime: 1000 * 60 * 60,
  });
  const isFocused = focusedTopicId === topic.id;
  const isOpen = openTopics.includes(topic.id);
  useEffect(() => {
    if (isOpen) {
      setFocusedTopicId(topic.id);
    } else if (focusedTopicId === topic.id) {
      setFocusedTopicId(null);
    }
  }, [isOpen, topic.id, focusedTopicId, setFocusedTopicId]);
  const [showDetails, setShowDetails] = useState(false);

  const subtopics = useMemo(() => sortSubtopics(buildSubtopics(topic)), [topic]);

  const topicBody = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{topic.description}</p>
        {subtopics.length > 0 && (
          <div className="rounded-xl border bg-white/70 p-3 shadow-sm dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Subtopics</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Open a subtopic page for details</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {subtopics.map((subtopic, idx) => (
                <Link
                  key={subtopic.id}
                  to={`/language/${languageSlug}/topic/${topic.id}/subtopic/${subtopic.id}`}
                  state={{
                    returnOpenTopics: openTopics,
                    returnFocusedTopicId: topic.id,
                  }}
                  className="w-full rounded-lg border bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:from-slate-900 dark:to-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{subtopic.label}</p>
                    <Badge variant="outline" className="text-[10px]">
                      Step {subtopic.order ?? idx + 1}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{subtopic.preview}</p>
                  <div className="mt-2 text-[11px] text-primary">View subtopic page →</div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {(topic.outcomes?.length || topic.example_exercises?.length) ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {topic.outcomes && topic.outcomes.length > 0 && (
              <div className="rounded-xl border bg-gradient-to-br from-emerald-50/60 to-emerald-100/40 p-3 dark:from-emerald-900/20 dark:to-emerald-800/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Outcomes
                    </span>
                  </div>
                  <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
                    {topic.outcomes.length}
                  </Badge>
                </div>
                <div className="mt-2 space-y-2">
                  {topic.outcomes.slice(0, 3).map((outcome: any, idx: number) => {
                    const text = typeof outcome === "string"
                      ? outcome
                      : outcome?.title || outcome?.description || "";
                    return (
                      <div key={idx} className="flex items-start gap-2 rounded-md bg-white/70 px-2 py-1 text-[13px] leading-snug text-slate-700 dark:bg-emerald-950/40 dark:text-emerald-50">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <p className="flex-1">{text}</p>
                      </div>
                    );
                  })}
                  {topic.outcomes.length > 3 && (
                    <p className="text-[11px] text-muted-foreground">
                      +{topic.outcomes.length - 3} more outcomes
                    </p>
                  )}
                </div>
              </div>
            )}
            {topic.example_exercises && topic.example_exercises.length > 0 && (
              <div className="rounded-xl border bg-gradient-to-br from-indigo-50/60 to-indigo-100/40 p-3 dark:from-indigo-900/20 dark:to-indigo-800/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Exercises
                    </span>
                  </div>
                  <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
                    {topic.example_exercises.length}
                  </Badge>
                </div>
                <div className="mt-2 space-y-2">
                  {topic.example_exercises.slice(0, 3).map((exercise, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-md bg-white/70 px-2 py-1 text-[13px] leading-snug text-slate-700 dark:bg-indigo-950/40 dark:text-indigo-50">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      <p className="flex-1">{exercise}</p>
                    </div>
                  ))}
                  {topic.example_exercises.length > 3 && (
                    <p className="text-[11px] text-muted-foreground">
                      +{topic.example_exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
        {topic.helpful_references && topic.helpful_references.length > 0 && (
          <div>
            <span className="font-medium text-xs text-muted-foreground">References: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {topic.helpful_references.map((ref, idx) => {
                const canonicalSource = curriculum.canonical_sources?.find((cs) => cs.id === ref.sourceId);
                if (!canonicalSource) return null;
                return (
                  <a
                    href={canonicalSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={idx}
                    className="flex items-center text-blue-500 hover:underline text-xs"
                    title={`${canonicalSource.title} (${canonicalSource.steward}): ${canonicalSource.short_summary}`}
                  >
                    {canonicalSource.title} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Summary & takeaways</h3>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? "Hide" : "View"}
          </Button>
        </div>

        {summaryQuery.isLoading && (
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <p className="text-sm font-semibold">Preparing summary...</p>
            <Progress className="w-40" value={60} />
          </div>
        )}

        {summaryQuery.isError && (
          <p className="text-xs text-red-500">Unable to load summary right now.</p>
        )}

        {summaryQuery.data && showDetails && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Summary</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowSummary((prev) => !prev)}
                >
                  {showSummary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
                {showSummary ? (
                  <div className="text-sm max-h-72 overflow-auto space-y-2">
                    <h4 className="font-semibold">{summaryQuery.data.content?.title}</h4>
                    {summaryQuery.data.content?.sections?.map((section: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <p className="font-medium">{section.heading}</p>
                        {section.paragraphs?.map((p: string, pIdx: number) => (
                          <p key={pIdx} className="text-xs text-muted-foreground">
                            {p}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Summary hidden.</p>
                )}
              </div>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <p className="text-sm font-semibold">Quick takeaways</p>
              <div className="space-y-2">
                {summaryQuery.data.content?.sections?.slice(0, 3).map((section: any, idx: number) => (
                  <div key={idx} className="p-2 rounded border text-xs space-y-1">
                    <p className="font-semibold">{section.heading}</p>
                    {section.paragraphs?.[0] && <p className="text-muted-foreground">{section.paragraphs[0]}</p>}
                  </div>
                ))}
                {(!summaryQuery.data.content?.sections ||
                  summaryQuery.data.content.sections.length === 0) && (
                    <p className="text-xs text-muted-foreground">
                      Summary is ready—expand to view details.
                    </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <TopicQuizDialog topic={topic} subject={normalizedLanguageSlug} />
    </div>
  );

  return (
    <AccordionItem value={topic.id} key={topic.id}>
      <AccordionTrigger
        className={`text-left ${level === 0 ? "font-semibold text-base" : "text-sm"}`}
        onClick={() => {
          const currentlyOpen = openTopics.includes(topic.id);
          setOpenTopics(
            currentlyOpen
              ? openTopics.filter((id) => id !== topic.id)
              : [...openTopics, topic.id],
          );
        }}
      >
        <div className="flex justify-between items-center w-full pr-4">
          <span>
            {topic.order}. {topic.title}
          </span>
          {topic.estimated_hours > 0 && (
            <Badge variant="outline" className="ml-2 whitespace-nowrap">
              {topic.estimated_hours} hrs
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent
        className={`pl-4 transition duration-200 ${
          focusedTopicId && focusedTopicId !== topic.id ? "opacity-40 blur-[1px] pointer-events-none" : ""
        }`}
      >
        {isFocused ? (
          <p className="text-xs text-muted-foreground">Topic is open in focus view.</p>
        ) : (
          <>
            {topicBody}
          </>
        )}
      </AccordionContent>
      {isFocused && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4"
          onClick={() => {
            setFocusedTopicId(null);
            setOpenTopics(openTopics.filter((id) => id !== topic.id));
          }}
        >
          <div
            className="w-full max-w-5xl mt-10 rounded-lg border bg-card p-4 shadow-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFocusedTopicId(null);
                  setOpenTopics(openTopics.filter((id) => id !== topic.id));
                }}
              >
                Close
              </Button>
            </div>
            <div className="mt-2 space-y-4">
              {topicBody}
            </div>
          </div>
        </div>
      )}
    </AccordionItem>
  );
}

export function CurriculumBreakdown({
  curriculum,
  languageSlug,
  initialOpenTopics = [],
  initialFocusedTopicId = null,
}: {
  curriculum: CurriculumDTO;
  assetScoring?: AssetScoringConfig | null;
  languageSlug: string;
  initialOpenTopics?: string[];
  initialFocusedTopicId?: string | null;
}) {
  const initialOpenKey = useMemo(() => initialOpenTopics.join("|"), [initialOpenTopics]);
  const [focusedTopicId, setFocusedTopicId] = useState<string | null>(initialFocusedTopicId);
  const [openTopics, setOpenTopics] = useState<string[]>(() => {
    const merged = [...new Set([...initialOpenTopics, ...(initialFocusedTopicId ? [initialFocusedTopicId] : [])])];
    return merged;
  });

  useEffect(() => {
    setOpenTopics((prev) => {
      const merged = [...new Set([...initialOpenTopics, ...(initialFocusedTopicId ? [initialFocusedTopicId] : [])])];
      const keyPrev = prev.join("|");
      const keyMerged = merged.join("|");
      return keyPrev === keyMerged ? prev : merged;
    });
    setFocusedTopicId(initialFocusedTopicId ?? null);
  }, [initialOpenKey, initialFocusedTopicId]);

  useEffect(() => {
    if (focusedTopicId) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [focusedTopicId]);

  return (
    <div className="mb-8">

      <div className="space-y-6">
        {curriculum.overall_learning_path.map((levelData: LearningLevelDTO) => (
          <Card key={levelData.level}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span>{levelData.level}</span>
                  {levelData.level.toLowerCase().includes("expert") && (
                    <Badge variant="outline" className="text-[11px] border-orange-500 text-orange-600">
                      LEARNING RESOURCES IN PROGRESS
                    </Badge>
                  )}
                </div>
                <Badge className="bg-blue-500 text-white">
                  {formatHours(getLevelHours(levelData))} hrs est.
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion
                  type="multiple"
                  value={openTopics}
                  onValueChange={(val) => setOpenTopics(Array.isArray(val) ? val : [])}
                  className="w-full"
                >
                  {levelData.topics.map((topic) => (
                    <TopicItem
                      key={topic.id}
                      topic={topic}
                      curriculum={curriculum}
                      level={0}
                      languageSlug={languageSlug}
                      focusedTopicId={focusedTopicId}
                      setFocusedTopicId={setFocusedTopicId}
                      openTopics={openTopics}
                      setOpenTopics={setOpenTopics}
                    />
                  ))}
                </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
