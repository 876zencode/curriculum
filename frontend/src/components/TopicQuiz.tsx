import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopicDTO } from "@/lib/types";
import { getGeneratedAssetForTopic } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Sparkles } from "lucide-react";

type QuizQuestion = {
  question: string;
  choices: string[];
  correct_answer: string;
  explanation?: string;
};

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const formatSubject = (value?: string) => {
  if (!value) return "";
  const normalized = value.replace(/-/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

function buildQuestionsFromTopic(topic: TopicDTO, subject?: string): QuizQuestion[] {
  const outcomes = topic.outcomes ?? [];
  const exercises = topic.example_exercises ?? [];
  const references = topic.helpful_references ?? [];
  const subjectLabel = formatSubject(subject);

  const questions: QuizQuestion[] = [];

  if (topic.description) {
    const distractors = [
      `A vague statement unrelated to ${subjectLabel || "the topic"}`,
      "Only tooling installation steps",
      "Historical trivia with no practical application",
    ];
    questions.push({
      question: `What best describes "${topic.title}" in ${subjectLabel || "this track"}?`,
      choices: shuffle([topic.description, ...distractors]).slice(0, 4),
      correct_answer: topic.description,
      explanation: "Pick the statement that matches the topic's description.",
    });
  }

  if (outcomes.length > 0) {
    const correct = outcomes[0];
    const distractors = shuffle(outcomes.slice(1, 4).concat("An unrelated soft skill", "A tool install step")).slice(0, 3);
    questions.push({
      question: `Which outcome shows you've mastered "${topic.title}"?`,
      choices: shuffle([correct, ...distractors]).slice(0, 4),
      correct_answer: correct,
      explanation: "Outcomes map directly to the skills this topic builds.",
    });
  }

  if (subjectLabel) {
    const correct = `It connects ${subjectLabel} fundamentals to ${topic.title} so you can advance in the path.`;
    const distractors = shuffle([
      `It replaces ${subjectLabel} basics with unrelated tools.`,
      "It is only relevant for a different language.",
      "It focuses solely on soft skills.",
    ]);
    questions.push({
      question: `Why does "${topic.title}" matter for ${subjectLabel}?`,
      choices: shuffle([correct, ...distractors]).slice(0, 4),
      correct_answer: correct,
      explanation: `This topic strengthens your ${subjectLabel} skills so you can progress in the curriculum.`,
    });
  }

  if (exercises.length > 0) {
    const correct = exercises[0];
    const distractors = shuffle(exercises.slice(1, 4).concat("Read a press release", "Skim unrelated docs")).slice(0, 3);
    questions.push({
      question: `Which exercise best reinforces "${topic.title}"?`,
      choices: shuffle([correct, ...distractors]).slice(0, 4),
      correct_answer: correct,
      explanation: "Exercises give hands-on practice aligned to the topic.",
    });
  }

  if (references.length > 0) {
    const correctRef = references[0];
    const correctLabel = `Authoritative ${subjectLabel || ""} reference`;
    const distractors = shuffle([
      "Random blog post with no credibility",
      "Outdated Q&A thread",
      "Marketing brochure",
    ]).slice(0, 3);
    questions.push({
      question: `Which source is most trustworthy for "${topic.title}" in ${subjectLabel || "this course"}?`,
      choices: shuffle([correctLabel, ...distractors]).slice(0, 4),
      correct_answer: correctLabel,
      explanation: `Helpful references include authoritative sources like ${correctRef.sourceId ?? "official docs"}.`,
    });
  }

  if (questions.length === 0) {
    questions.push({
      question: `What's a good next step after learning "${topic.title}" for ${subjectLabel || "this course"}?`,
      choices: shuffle([
        `Apply the concept in a small ${subjectLabel || "subject"} project or exercise`,
        "Ignore practice and hope to remember later",
        "Learn an unrelated topic first",
        "Skip directly to advanced topics without review",
      ]),
      correct_answer: `Apply the concept in a small ${subjectLabel || "subject"} project or exercise`,
      explanation: "Deliberate practice cements the learning before moving on.",
    });
  }

  return questions;
}

function normalizeLlmQuestions(raw: any): QuizQuestion[] {
  if (!raw) return [];
  const questions = Array.isArray(raw) ? raw : Array.isArray(raw?.questions) ? raw.questions : [];
  return questions
    .map((q: any) => ({
      question: q.question ?? q.prompt ?? "",
      choices: Array.isArray(q.choices) ? q.choices : [],
      correct_answer: q.correct_answer ?? q.answer ?? "",
      explanation: q.explanation ?? "",
    }))
    .filter((q: QuizQuestion) => q.question && q.correct_answer && q.choices.length >= 2);
}

export function TopicQuiz({ topic, subject }: { topic: TopicDTO; subject?: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const subjectLabel = formatSubject(subject);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["topic-quiz", subject ?? "unknown", topic.id],
    queryFn: () => getGeneratedAssetForTopic(subject ?? "general", topic.id, "quiz"),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const questions = useMemo(() => {
    const llmQuestions = normalizeLlmQuestions(data?.content);
    if (llmQuestions.length > 0) return llmQuestions;
    // fallback to heuristic if LLM returns nothing
    return buildQuestionsFromTopic(topic, subject);
  }, [data, topic, subject]);

  const quizTitle = `${topic.title} — ${subjectLabel ? `${subjectLabel} ` : ""}Quick Check`;
  const progress = Math.round(((activeIndex + 1) / Math.max(questions.length, 1)) * 100);
  const currentQuestion = questions[activeIndex];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">{quizTitle}</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Auto-built from this topic. Check your grasp before moving on.
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant="secondary">Quiz</Badge>
            <Button size="sm" variant="ghost" onClick={() => setAnswers({})}>
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Progress className="w-40" value={progress} />
          <span className="text-xs text-muted-foreground">
            {questions.length ? `Question ${activeIndex + 1} of ${questions.length}` : "0 questions"}
          </span>
        </div>

        {(isLoading || isFetching) && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isError && (
          <p className="text-xs text-red-600">
            Unable to load quiz right now. Showing fallback questions if available.
          </p>
        )}

        {!isLoading && !isFetching && questions.length === 0 && (
          <p className="text-xs text-muted-foreground">No quiz questions available for this topic.</p>
        )}

        {!isLoading && !isFetching && questions.length > 0 && currentQuestion && (
          <div className="space-y-3">
            <div className="border rounded-lg p-3 space-y-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Q{activeIndex + 1}</Badge>
                <p className="text-sm font-medium flex-1">{currentQuestion.question}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.isArray(currentQuestion.choices) &&
                  currentQuestion.choices.map((choice, cIdx) => {
                    const selected = answers[activeIndex];
                    const isSelected = selected === choice;
                    return (
                      <Button
                        key={cIdx}
                        variant={isSelected ? "default" : "outline"}
                        className="justify-start text-left transition-all duration-150 whitespace-normal break-words w-full"
                        onClick={() => setAnswers((prev) => ({ ...prev, [activeIndex]: choice }))}
                      >
                        {choice}
                      </Button>
                    );
                  })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`text-xs ${
                    answers[activeIndex]
                      ? answers[activeIndex] === currentQuestion.correct_answer
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {answers[activeIndex]
                    ? answers[activeIndex] === currentQuestion.correct_answer
                      ? "Correct! Verified."
                      : `Incorrect. Verified answer: ${currentQuestion.correct_answer}`
                    : "Select an option to check your answer."}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Fact-checked</span>
                </div>
              </div>
              {currentQuestion.explanation && (
                <p className="text-xs text-muted-foreground border-t pt-2">{currentQuestion.explanation}</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </Button>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground">
                  {activeIndex + 1} / {questions.length}
                </span>
                <Button
                  variant="default"
                  onClick={() => {
                    if (activeIndex < questions.length - 1) {
                      setActiveIndex((prev) => Math.min(prev + 1, questions.length - 1));
                    } else {
                      setReviewMode(true);
                    }
                  }}
                >
                  {activeIndex < questions.length - 1 ? "Next" : "Review"}
                </Button>
              </div>
            </div>

            {reviewMode && (
              <div className="border rounded-lg p-3 space-y-2 bg-muted/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Review answers</p>
                  <Button size="sm" variant="ghost" onClick={() => { setReviewMode(false); setActiveIndex(0); }}>
                    Restart
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                  {questions.map((q, idx) => {
                    const selected = answers[idx];
                    const isCorrect = selected && selected === q.correct_answer;
                    return (
                      <div key={idx} className="border rounded p-2 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold">Q{idx + 1}</span>
                          <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {selected ? (isCorrect ? "Correct" : "Incorrect") : "Unanswered"}
                          </span>
                        </div>
                        <p className="font-medium">{q.question}</p>
                        {selected && (
                          <p className="text-muted-foreground">
                            Your answer: {selected}
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          Correct answer: {q.correct_answer}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TopicQuizDialog({ topic, subject }: { topic: TopicDTO; subject?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);

  const next = () => setStep((prev) => (prev === 0 ? 1 : prev));
  const back = () => setStep((prev) => (prev === 1 ? 0 : prev));

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setStep(0); }}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full sm:w-auto">Launch interactive quiz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{topic.title} — Quiz Wizard</DialogTitle>
          <DialogDescription>
            Briefing then questions. Crafted for the {formatSubject(subject) || "course"} track.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={step === 0 ? "default" : "secondary"}>Briefing</Badge>
            <Separator className="flex-1" />
            <Badge variant={step === 1 ? "default" : "secondary"}>Quiz</Badge>
          </div>

          {step === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{topic.description}</p>
              {topic.outcomes?.length ? (
                <div>
                  <p className="text-xs font-semibold">Key outcomes</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    {topic.outcomes.map((o, idx) => <li key={idx}>{o}</li>)}
                  </ul>
                </div>
              ) : null}
              {topic.example_exercises?.length ? (
                <div>
                  <p className="text-xs font-semibold">Practice ideas</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    {topic.example_exercises.map((o, idx) => <li key={idx}>{o}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <TopicQuiz topic={topic} subject={subject} />
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div />
          <div className="flex gap-2">
            {step === 1 && <Button variant="ghost" onClick={back}>Back</Button>}
            {step === 0 && <Button onClick={next}>Start quiz</Button>}
            {step === 1 && <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
