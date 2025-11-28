import { useState } from "react";
import { CurriculumDTO, LearningLevelDTO, TopicDTO, LearningResourceDTO, GeneratedAssetDTO } from "@/lib/types";
import { getGeneratedAssetForTopic } from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription import
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Book, Video, FileText, Github, Globe, Eye, EyeOff } from "lucide-react"; // Added new icons
import { useMutation } from "@tanstack/react-query";

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
const renderLearningResources = (resources: LearningResourceDTO[]) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
    {resources.map((resource, index) => (
      <Card key={index}>
        <CardHeader>
          <CardTitle className="text-md">{resource.title}</CardTitle>
          <CardDescription className="flex items-center text-sm">
            <span className={`px-2 py-0.5 rounded-full ${getResourceTypeColorClass(resource.type)} mr-2`}>
              {resource.type}
            </span>
            | Authority: {(resource.authority_score * 100).toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">{resource.short_summary}</p>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full">
              {getIconForResourceType(resource.type)} View Resource <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </a>
        </CardContent>
      </Card>
    ))}
  </div>
);

function TopicItem({
  topic,
  curriculum,
  level = 0,
  languageSlug,
}: {
  topic: TopicDTO;
  curriculum: CurriculumDTO;
  level?: number;
  languageSlug: string;
}) {
  const [showSummary, setShowSummary] = useState(true);
  const [showAudio, setShowAudio] = useState(true);
  const [showQuiz, setShowQuiz] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const summaryMutation = useMutation<GeneratedAssetDTO, Error>({
    mutationFn: () => getGeneratedAssetForTopic(languageSlug, topic.id, "summary_article"),
    onSuccess: () => setShowSummary(true),
  });

  const audioMutation = useMutation<GeneratedAssetDTO, Error>({
    mutationFn: () => getGeneratedAssetForTopic(languageSlug, topic.id, "audio_lesson"),
    onSuccess: () => setShowAudio(true),
  });

  const quizMutation = useMutation<GeneratedAssetDTO, Error>({
    mutationFn: () => getGeneratedAssetForTopic(languageSlug, topic.id, "quiz"),
    onSuccess: () => setShowQuiz(true),
  });

  return (
    <AccordionItem value={topic.id} key={topic.id}>
      <AccordionTrigger className={`text-left ${level === 0 ? "font-semibold text-base" : "text-sm"}`}>
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
      <AccordionContent className="pl-4">
        <p className="text-sm text-muted-foreground mb-2">{topic.description}</p>
        {topic.outcomes && topic.outcomes.length > 0 && (
          <div className="mb-2">
            <span className="font-medium text-xs text-muted-foreground">Outcomes: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {topic.outcomes.map((outcome, idx) => (
                <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-xs">
                  {outcome}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {topic.example_exercises && topic.example_exercises.length > 0 && (
          <div className="mb-2">
            <span className="font-medium text-xs text-muted-foreground">Exercises: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {topic.example_exercises.map((exercise, idx) => (
                <Badge key={idx} variant="outline" className="px-2 py-0.5 text-xs">
                  {exercise}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {topic.helpful_references && topic.helpful_references.length > 0 && (
          <div className="mb-2">
            <span className="font-medium text-xs text-muted-foreground">References: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {topic.helpful_references.map((ref, idx) => {
                const canonicalSource = curriculum.canonical_sources?.find((cs) => cs.id === ref.sourceId);
                if (!canonicalSource) return null; // Or render a fallback

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

        <div className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Resources & Assets</CardTitle>
              <CardDescription className="text-xs">
                Dive into curated links plus AI-generated summaries, audio lessons, and quizzes tailored to this topic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="curated">
                  <AccordionTrigger className="text-sm font-medium">Curated resources</AccordionTrigger>
                  <AccordionContent>
                    {topic.learning_resources && topic.learning_resources.length > 0 ? (
                      renderLearningResources(topic.learning_resources)
                    ) : (
                      <p className="text-xs text-muted-foreground">No curated resources available.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="generated">
                  <AccordionTrigger className="text-sm font-medium">Generated materials</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => summaryMutation.mutate()}
                        disabled={summaryMutation.isPending}
                      >
                        {summaryMutation.isPending ? "Generating summary…" : "Generate Summary"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => audioMutation.mutate()}
                        disabled={audioMutation.isPending}
                      >
                        {audioMutation.isPending ? "Generating audio…" : "Generate Audio Lesson"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => quizMutation.mutate()}
                        disabled={quizMutation.isPending}
                      >
                        {quizMutation.isPending ? "Generating quiz…" : "Generate Quiz"}
                      </Button>
                    </div>
                    {(summaryMutation.isPending || audioMutation.isPending || quizMutation.isPending) && (
                      <div className="flex items-center gap-2 mb-2">
                        <Progress
                          className="w-40"
                          value={
                            summaryMutation.isPending || audioMutation.isPending || quizMutation.isPending ? 60 : 100
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {summaryMutation.isPending
                            ? "Building summary…"
                            : audioMutation.isPending
                              ? "Preparing audio script…"
                              : quizMutation.isPending
                                ? "Writing quiz…"
                                : ""}
                        </span>
                      </div>
                    )}
                    {summaryMutation.isError && (
                      <p className="text-xs text-red-500">Unable to generate summary right now.</p>
                    )}
                    {audioMutation.isError && (
                      <p className="text-xs text-red-500">Unable to generate audio lesson right now.</p>
                    )}
                    {quizMutation.isError && (
                      <p className="text-xs text-red-500">Unable to generate quiz right now.</p>
                    )}
                    <Accordion type="single" collapsible className="space-y-2">
                      <AccordionItem value="summary-material">
                        <AccordionTrigger className="text-sm font-medium">Summary</AccordionTrigger>
                        <AccordionContent>
                          {summaryMutation.data ? (
                            <div className="text-sm border p-2 rounded bg-muted max-h-72 overflow-auto">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold">{summaryMutation.data.content?.title}</h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setShowSummary((prev) => !prev)}
                                >
                                  {showSummary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              {showSummary &&
                                summaryMutation.data.content?.sections?.map((section: any, idx: number) => (
                                  <div key={idx} className="mb-2">
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
                            <p className="text-xs text-muted-foreground">Generate a summary to see it here.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="audio-material">
                        <AccordionTrigger className="text-sm font-medium">Audio</AccordionTrigger>
                        <AccordionContent>
                          {audioMutation.data?.audio_url ? (
                            <div className="text-sm border p-2 rounded bg-muted max-h-72 overflow-auto">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold">Audio Lesson</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setShowAudio((prev) => !prev)}
                                >
                                  {showAudio ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              {showAudio && <audio controls src={audioMutation.data.audio_url} className="w-full" />}
                            </div>
                          ) : audioMutation.data?.content?.script ? (
                            <div className="text-sm border p-2 rounded bg-muted max-h-72 overflow-auto">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold">Audio Script</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setShowAudio((prev) => !prev)}
                                >
                                  {showAudio ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              {showAudio && (
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                  {audioMutation.data.content.script}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Generate an audio lesson to see it here.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="quiz-material">
                        <AccordionTrigger className="text-sm font-medium">Quiz</AccordionTrigger>
                        <AccordionContent>
                          {quizMutation.data ? (
                            <div className="text-sm border p-2 rounded bg-muted max-h-96 overflow-auto space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">{quizMutation.data.content?.title ?? "Quiz"}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Tap an answer to check yourself.
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowQuiz((prev) => !prev)}
                                  >
                                    {showQuiz ? "Hide" : "Show"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setShowQuiz(true);
                                      setQuizAnswers({});
                                    }}
                                  >
                                    Reset
                                  </Button>
                                </div>
                              </div>
                              {showQuiz && Array.isArray(quizMutation.data.content?.questions) ? (
                                <div className="space-y-3">
                                  {quizMutation.data.content.questions.map((q: any, idx: number) => {
                                    const selected = quizAnswers[idx];
                                    const isCorrect = selected && selected === q.correct_answer;
                                    return (
                                      <div key={idx} className="border rounded p-2 bg-background space-y-2">
                                        <p className="text-sm font-medium">{q.question}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {Array.isArray(q.choices) &&
                                            q.choices.map((choice: string, cIdx: number) => {
                                              const isSelected = selected === choice;
                                              return (
                                                <Button
                                                  key={cIdx}
                                                  variant={isSelected ? "default" : "outline"}
                                                  className="justify-start text-left"
                                                  onClick={() =>
                                                    setQuizAnswers((prev) => ({ ...prev, [idx]: choice }))
                                                  }
                                                >
                                                  {choice}
                                                </Button>
                                              );
                                            })}
                                        </div>
                                        <p
                                          className={`text-xs ${
                                            selected
                                              ? isCorrect
                                                ? "text-green-600"
                                                : "text-red-600"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {selected
                                            ? isCorrect
                                              ? "Correct!"
                                              : `Incorrect. Answer: ${q.correct_answer}`
                                            : "Select an option to check your answer."}
                                        </p>
                                        {q.explanation && (
                                          <p className="text-xs text-muted-foreground">{q.explanation}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                showQuiz && <p className="text-xs text-muted-foreground">No questions returned.</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Generate a quiz to see it here.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {topic.subtopics && topic.subtopics.length > 0 && (
          <div className="pl-4 border-l ml-2 mt-2">
            <Accordion type="multiple" className="w-full">
              {topic.subtopics.map((subtopic) => (
                <TopicItem
                  key={subtopic.id}
                  topic={subtopic}
                  curriculum={curriculum}
                  level={level + 1}
                  languageSlug={languageSlug}
                />
              ))}
            </Accordion>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function CurriculumBreakdown({ curriculum }: { curriculum: CurriculumDTO }) {
  const languageSlug = curriculum.language;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Curriculum Breakdown</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Structured path from Beginner to Expert, with estimated hours per level and key topics.
        {/* (Generated by {curriculum.model_version} at {new Date(curriculum.generated_at).toLocaleString()}) */}
      </p>

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
              <Accordion type="multiple" className="w-full">
                {levelData.topics.map((topic) => (
                  <TopicItem
                    key={topic.id}
                    topic={topic}
                    curriculum={curriculum}
                    level={0}
                    languageSlug={languageSlug}
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
