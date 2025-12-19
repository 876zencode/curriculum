import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurriculum, getLanguages } from "@/lib/api";
import type { CurriculumDTO, LanguageOption, LearningLevelDTO, TopicDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, FileText, RefreshCw } from "lucide-react";

const formatHours = (hours?: number) => {
  if (!hours || Number.isNaN(hours)) return "";
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hrs`;
};

const sortTopics = (topics: TopicDTO[]) =>
  [...topics].sort((a, b) => {
    const aOrder = typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
    const bOrder = typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.title.localeCompare(b.title);
  });

const formatTopicLines = (topic: TopicDTO, depth = 0, lines: string[] = []) => {
  const indent = "  ".repeat(depth);
  const description = topic.description ? ` — ${topic.description}` : "";
  lines.push(`${indent}- ${topic.title}${description}`);

  const subtopics = sortTopics(topic.subtopics ?? []);
  subtopics.forEach((sub) => formatTopicLines(sub, depth + 1, lines));
  return lines;
};

const buildExport = (curriculum: CurriculumDTO, subjectLabel: string) => {
  const lines: string[] = [];
  lines.push(`# ${subjectLabel} Curriculum Export`);
  lines.push(`Generated: ${new Date(curriculum.generated_at).toLocaleString()}`);
  lines.push("");
  lines.push("## Subject Overview");
  lines.push(curriculum.explanation || "No description available.");
  lines.push("");
  lines.push("## Main Topics & Subtopics");

  (curriculum.overall_learning_path ?? []).forEach((level: LearningLevelDTO) => {
    lines.push("");
    const hours = formatHours(level.estimated_hours);
    lines.push(`### ${level.level}${hours ? ` (${hours})` : ""}`);

    const topics = sortTopics(level.topics ?? []);
    if (topics.length === 0) {
      lines.push("- No topics found for this level.");
      return;
    }

    topics.forEach((topic) => formatTopicLines(topic, 0, lines));
  });

  return lines.join("\n");
};

export function CurriculumExportPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    data: languages = [],
    isLoading: languagesLoading,
    error: languagesError,
    refetch: refetchLanguages,
  } = useQuery<LanguageOption[], Error>({
    queryKey: ["languages"],
    queryFn: getLanguages,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!selectedSlug && languages.length > 0) {
      setSelectedSlug(languages[0].slug);
    }
  }, [languages, selectedSlug]);

  const {
    data: curriculum,
    isLoading: curriculumLoading,
    error: curriculumError,
    refetch: refetchCurriculum,
  } = useQuery<CurriculumDTO, Error>({
    queryKey: ["curriculum-export", selectedSlug],
    queryFn: () => getCurriculum(selectedSlug || ""),
    enabled: Boolean(selectedSlug),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const selectedLanguageLabel = useMemo(() => {
    const found = languages.find((lang) => lang.slug === selectedSlug);
    return found?.label || found?.slug || selectedSlug || "Subject";
  }, [languages, selectedSlug]);

  const exportText = useMemo(() => {
    if (!curriculum || !selectedSlug) return "";
    return buildExport(curriculum, selectedLanguageLabel);
  }, [curriculum, selectedLanguageLabel, selectedSlug]);

  const handleCopy = async () => {
    if (!exportText) return;
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Unable to copy export", err);
    }
  };

  const handleDownload = () => {
    if (!exportText || !selectedSlug) return;
    const blob = new Blob([exportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedSlug}-curriculum-export.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = languagesLoading || curriculumLoading;

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Curriculum Exporter</h1>
            <p className="text-sm text-muted-foreground">
              Export any subject with its description, main topics, and subtopics in a highly readable Markdown layout.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetchLanguages()} disabled={languagesLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reload subjects
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchCurriculum()}
              disabled={!selectedSlug || curriculumLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh export
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Available subjects</CardTitle>
          <CardDescription className="text-sm">
            Choose a curriculum to generate its export-ready outline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {languagesError && (
            <p className="text-sm text-red-500">Unable to load subjects: {languagesError.message}</p>
          )}
          {languages.length === 0 && !languagesLoading && (
            <p className="text-sm text-muted-foreground">No subjects available yet.</p>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {languages.map((lang) => {
              const isActive = lang.slug === selectedSlug;
              return (
                <button
                  key={lang.slug}
                  onClick={() => setSelectedSlug(lang.slug)}
                  className={`flex items-center justify-between rounded-lg border p-3 text-left transition hover:shadow-sm ${
                    isActive ? "border-primary bg-primary/5" : "border-muted bg-card"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{lang.label || lang.slug}</p>
                    <p className="text-xs text-muted-foreground">{lang.slug}</p>
                  </div>
                  {isActive && (
                    <Badge variant="default" className="text-[11px]">
                      Selected
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {selectedLanguageLabel} export
              </CardTitle>
              <CardDescription className="text-sm">
                {curriculum?.explanation || "Pick a subject to see its export-ready curriculum."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={!exportText}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy export"}
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={!exportText}>
                <Download className="mr-2 h-4 w-4" />
                Download .md
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          {curriculumError && (
            <p className="text-sm text-red-500">Unable to load curriculum: {curriculumError.message}</p>
          )}
          {isLoading && <p className="text-sm text-muted-foreground">Loading export data...</p>}
          {!isLoading && exportText && (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border bg-slate-950 text-slate-100 shadow-inner">
                <pre className="whitespace-pre-wrap p-4 text-sm leading-relaxed font-mono">
                  {exportText}
                </pre>
              </div>
              <div className="space-y-3">
                {(curriculum?.overall_learning_path ?? []).map((level) => (
                  <div key={level.level} className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {level.level}
                        </Badge>
                        {level.estimated_hours ? (
                          <span className="text-xs text-muted-foreground">
                            {formatHours(level.estimated_hours)}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Main topics
                      </span>
                    </div>
                    <ul className="mt-2 space-y-2">
                      {sortTopics(level.topics ?? []).map((topic) => (
                        <li key={topic.id} className="rounded border bg-card px-3 py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{topic.title}</p>
                            {topic.estimated_hours ? (
                              <Badge variant="outline" className="text-[11px]">
                                {formatHours(topic.estimated_hours)}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                              {sortTopics(topic.subtopics).map((sub) => (
                                <li key={sub.id} className="flex gap-2">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                                  <div>
                                    <p className="font-medium text-slate-900 text-xs">{sub.title}</p>
                                    <p className="text-[11px] text-muted-foreground">{sub.description}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isLoading && !exportText && (
            <p className="text-sm text-muted-foreground">
              Select a subject above to generate a clean, export-ready curriculum outline.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
