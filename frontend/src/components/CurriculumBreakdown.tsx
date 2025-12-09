import { useEffect, useState } from "react";
import {
  AssetScoringConfig,
  AssetScoringTier,
  CurriculumDTO,
  LearningLevelDTO,
  TopicDTO,
  LearningResourceDTO,
  GeneratedAssetDTO,
} from "@/lib/types";
import { getGeneratedAssetForTopic } from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ExternalLink,
  Book,
  Video,
  FileText,
  Github,
  Globe,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Dumbbell,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TopicQuizDialog } from "./TopicQuiz";
import { normalizeLanguageKey } from "@/lib/curriculumEngine";

// Helper function to get icon based on resource type
const getIconForResourceType = (type: string) => {
  switch (type.toLowerCase()) {
    case "documentation":
    case "article":
    case "tutorial": // Added tutorial
      return <FileText className="h-4 w-4 mr-2" />;
    case "video":
      return <Video className="h-4 w-4 mr-2" />;
    case "github":
      return <Github className="h-4 w-4 mr-2" />;
    case "book":
      return <Book className="h-4 w-4 mr-2" />;
    default:
      return <Globe className="h-4 w-4 mr-2" />;
  }
};

// Helper function to get color class based on resource type
const getResourceTypeColorClass = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return "bg-green-500 text-white";
    case "article":
    case "documentation":
    case "tutorial":
      return "bg-blue-500 text-white";
    case "github":
      return "bg-purple-500 text-white";
    case "book":
      return "bg-yellow-500 text-black"; // Text might need to be black for yellow bg
    default:
      return "bg-gray-500 text-white";
  }
};

// Calculate estimated hours recursively for topics and levels
const getTopicHours = (topic: TopicDTO): number => {
  const selfHours = Number(topic.estimated_hours ?? 0);
  const subHours = (topic.subtopics ?? []).reduce((sum, sub) => sum + getTopicHours(sub), 0);
  return selfHours + subHours;
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

// Helper function to render learning resources
const renderLearningResources = (
  resources: LearningResourceDTO[],
  tierMap?: Map<string, AssetScoringTier>,
) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    {resources.map((resource, index) => {
      const tier = resource.tier_id ? tierMap?.get(resource.tier_id) : undefined;
      const tierLabel = tier ? `${tier.label || tier.id}` : null;
      const authority = Number(resource.authority_score ?? 0) * 100;

      return (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-md leading-tight">{resource.title}</CardTitle>
              <span className={`px-2 py-0.5 rounded-full text-[11px] ${getResourceTypeColorClass(resource.type)}`}>
                {resource.type}
              </span>
            </div>
            <CardDescription className="flex items-center flex-wrap gap-2 text-xs">
              {tierLabel && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                  {tierLabel}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Authority {authority.toFixed(0)}%</span>
              </div>
              {typeof resource.final_score === "number" && (
                <span className="text-muted-foreground">Tier score {(resource.final_score * 100).toFixed(0)}%</span>
              )}
            </CardDescription>
            <Progress value={Math.min(Math.max(authority, 0), 100)} className="h-1.5" />
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-3">{resource.short_summary}</p>
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">{getIconForResourceType(resource.type)} View resource</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

function TopicItem({
  topic,
  curriculum,
  level = 0,
  languageSlug,
  assetTierMap,
  activeTierIds,
  focusedTopicId,
  setFocusedTopicId,
  openTopics,
  setOpenTopics,
}: {
  topic: TopicDTO;
  curriculum: CurriculumDTO;
  level?: number;
  languageSlug: string;
  assetTierMap?: Map<string, AssetScoringTier> | null;
  activeTierIds?: string[];
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

  const filteredResources =
    topic.learning_resources && topic.learning_resources.length > 0
      ? (!activeTierIds || activeTierIds.length === 0
          ? topic.learning_resources
          : topic.learning_resources.filter((res) => !res.tier_id || activeTierIds.includes(res.tier_id)))
      : [];

  const topicBody = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{topic.description}</p>
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
                  {topic.outcomes.slice(0, 3).map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-md bg-white/70 px-2 py-1 text-[13px] leading-snug text-slate-700 dark:bg-emerald-950/40 dark:text-emerald-50">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <p className="flex-1">{outcome}</p>
                    </div>
                  ))}
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
          <h3 className="text-sm font-semibold">Curated resources</h3>
        </div>
        {filteredResources && filteredResources.length > 0 ? (
          renderLearningResources(filteredResources, assetTierMap ?? undefined)
        ) : (
          <p className="text-xs text-muted-foreground">
            {topic.learning_resources && topic.learning_resources.length > 0
              ? "No resources match the selected tiers."
              : "No curated resources available."}
          </p>
        )}
      </section>

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
            {topic.subtopics && topic.subtopics.length > 0 && (
              <div className="pl-4 border-l ml-2 mt-2">
                <Accordion type="multiple" value={openTopics} onValueChange={(val) => setOpenTopics(Array.isArray(val) ? val : [])} className="w-full">
                  {topic.subtopics.map((subtopic) => (
                    <TopicItem
                      key={subtopic.id}
                      topic={subtopic}
                      curriculum={curriculum}
                      level={level + 1}
                      languageSlug={languageSlug}
                      assetTierMap={assetTierMap}
                      activeTierIds={activeTierIds}
                      focusedTopicId={focusedTopicId}
                      setFocusedTopicId={setFocusedTopicId}
                      openTopics={openTopics}
                      setOpenTopics={setOpenTopics}
                    />
                  ))}
                </Accordion>
              </div>
            )}
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
              {topic.subtopics && topic.subtopics.length > 0 && (
                <div className="pl-4 border-l mt-4">
                  <Accordion
                    type="multiple"
                    value={openTopics}
                    onValueChange={(val) => setOpenTopics(Array.isArray(val) ? val : [])}
                    className="w-full"
                  >
                    {topic.subtopics.map((subtopic) => (
                      <TopicItem
                        key={subtopic.id}
                        topic={subtopic}
                        curriculum={curriculum}
                        level={level + 1}
                        languageSlug={languageSlug}
                        assetTierMap={assetTierMap}
                        activeTierIds={activeTierIds}
                        focusedTopicId={focusedTopicId}
                        setFocusedTopicId={setFocusedTopicId}
                        openTopics={openTopics}
                        setOpenTopics={setOpenTopics}
                      />
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AccordionItem>
  );
}

export function CurriculumBreakdown({
  curriculum,
  assetScoring,
  languageSlug,
}: {
  curriculum: CurriculumDTO;
  assetScoring?: AssetScoringConfig | null;
  languageSlug: string;
}) {
  const tiers = [...(assetScoring?.tiers ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const tiersKey = tiers.map((t) => t.id).join("|");
  const [activeTierIds, setActiveTierIds] = useState<string[]>(() => tiers.map((tier) => tier.id));
  const assetTierMap = tiers.length ? new Map<string, AssetScoringTier>(tiers.map((tier) => [tier.id, tier])) : null;
  const [focusedTopicId, setFocusedTopicId] = useState<string | null>(null);
  const [openTopics, setOpenTopics] = useState<string[]>([]);

  useEffect(() => {
    setActiveTierIds(tiers.map((tier) => tier.id));
  }, [tiersKey]);

  useEffect(() => {
    if (focusedTopicId) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [focusedTopicId]);

  const toggleTier = (id: string) => {
    setActiveTierIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Curriculum Breakdown</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Structured path from Beginner to Expert, with estimated hours per level and key topics.
        {/* (Generated by {curriculum.model_version} at {new Date(curriculum.generated_at).toLocaleString()}) */}
      </p>

      {tiers.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Asset filters</CardTitle>
            <CardDescription className="text-xs">
              Toggle asset tiers from the scoring model to control which curated resources are shown.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {tiers.map((tier) => {
              const active = activeTierIds.includes(tier.id);
              return (
                <Button
                  key={tier.id}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => toggleTier(tier.id)}
                >
                  {tier.label || tier.id}
                </Button>
              );
            })}
            <div className="flex gap-2 w-full pt-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveTierIds(tiers.map((tier) => tier.id))}
              >
                Select all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setActiveTierIds([])}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {curriculum.overall_learning_path.map((levelData: LearningLevelDTO) => (
          <Card key={levelData.level}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{levelData.level}</span>
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
                      assetTierMap={assetTierMap}
                      activeTierIds={activeTierIds}
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
