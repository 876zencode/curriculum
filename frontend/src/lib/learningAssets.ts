import { callOpenAiChatJSON } from "./curriculumEngine";
import type { GeneratedAssetType, LearningResourceDTO, TopicDTO } from "./types";

export interface SummaryArticleContent {
  title: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  estimated_reading_minutes: number;
}

export interface AudioLessonContent {
  title: string;
  script: string;
  estimated_duration_minutes: number;
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  correct_answer: string;
  explanation?: string;
}

export interface QuizContent {
  title: string;
  questions: QuizQuestion[];
  estimated_duration_minutes?: number;
}

function buildTopicContext(topic: TopicDTO, resources: LearningResourceDTO[]): string {
  const resourceLines = resources.map((res) => `- ${res.title} (${res.type}): ${res.url}`);
  return [
    `Topic: ${topic.title}`,
    `Description: ${topic.description}`,
    topic.outcomes?.length ? `Outcomes: ${topic.outcomes.join("; ")}` : null,
    resourceLines.length ? `Existing resources:\n${resourceLines.join("\n")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSummaryPrompt(topic: TopicDTO, resources: LearningResourceDTO[]): string {
  const context = buildTopicContext(topic, resources);
  return `You are an expert technical educator. Write a concise learning article for the topic below.

Return a JSON object with:
{
  "title": "string",
  "sections": [{ "heading": "string", "paragraphs": ["string"] }],
  "estimated_reading_minutes": number
}

Keep it beginner/intermediate friendly, actionable, and tied to the topic context.

${context}`;
}

function buildAudioPrompt(topic: TopicDTO, resources: LearningResourceDTO[]): string {
  const context = buildTopicContext(topic, resources);
  return `You are an engaging instructor. Write a script for an audio lesson for the topic below.

Return a JSON object with:
{
  "title": "string",
  "script": "full narration text suitable to be read aloud",
  "estimated_duration_minutes": number
}

Use friendly, clear language and add light signposting between sections.

${context}`;
}

function buildQuizPrompt(topic: TopicDTO, resources: LearningResourceDTO[]): string {
  const context = buildTopicContext(topic, resources);
  return `You are creating a short formative quiz for the topic below.

Return a JSON object with:
{
  "title": "string",
  "questions": [
    {
      "question": "string",
      "choices": ["string"],
      "correct_answer": "string",
      "explanation": "string"
    }
  ],
  "estimated_duration_minutes": number
}

Keep questions lightweight and focused on key concepts.

${context}`;
}

function normalizeSummary(raw: any, topicTitle: string): SummaryArticleContent {
  const sectionsRaw = Array.isArray(raw?.sections) ? raw.sections : [];
  const sections = sectionsRaw.map((section: any) => ({
    heading: typeof section?.heading === "string" ? section.heading : "",
    paragraphs: Array.isArray(section?.paragraphs)
      ? section.paragraphs.map((p: any) => String(p))
      : [],
  }));

  return {
    title: typeof raw?.title === "string" ? raw.title : topicTitle,
    sections,
    estimated_reading_minutes: Number(raw?.estimated_reading_minutes ?? raw?.estimatedReadingMinutes ?? 5),
  };
}

function normalizeAudio(raw: any, topicTitle: string): AudioLessonContent {
  return {
    title: typeof raw?.title === "string" ? raw.title : topicTitle,
    script: typeof raw?.script === "string" ? raw.script : "",
    estimated_duration_minutes: Number(raw?.estimated_duration_minutes ?? raw?.estimatedDurationMinutes ?? 5),
  };
}

function normalizeQuiz(raw: any, topicTitle: string): QuizContent {
  const questionsRaw = Array.isArray(raw?.questions) ? raw.questions : [];
  const questions: QuizQuestion[] = questionsRaw.map((q: any) => ({
    question: typeof q?.question === "string" ? q.question : "",
    choices: Array.isArray(q?.choices) ? q.choices.map((c: any) => String(c)) : [],
    correct_answer:
      typeof q?.correct_answer === "string"
        ? q.correct_answer
        : typeof q?.correctAnswer === "string"
          ? q.correctAnswer
          : "",
    explanation:
      typeof q?.explanation === "string"
        ? q.explanation
        : typeof q?.explanationText === "string"
          ? q.explanationText
          : undefined,
  }));

  return {
    title: typeof raw?.title === "string" ? raw.title : `${topicTitle} Quiz`,
    questions,
    estimated_duration_minutes: Number(raw?.estimated_duration_minutes ?? raw?.estimatedDurationMinutes ?? 5),
  };
}

export async function generateLearningAssetContent(topic: TopicDTO, assetType: GeneratedAssetType): Promise<any> {
  const resources = topic.learning_resources ?? [];
  let prompt = "";

  if (assetType === "summary_article") {
    prompt = buildSummaryPrompt(topic, resources);
    const raw = await callOpenAiChatJSON(prompt);
    return normalizeSummary(raw, topic.title);
  }

  if (assetType === "audio_lesson") {
    prompt = buildAudioPrompt(topic, resources);
    const raw = await callOpenAiChatJSON(prompt);
    return normalizeAudio(raw, topic.title);
  }

  if (assetType === "quiz") {
    prompt = buildQuizPrompt(topic, resources);
    const raw = await callOpenAiChatJSON(prompt);
    return normalizeQuiz(raw, topic.title);
  }

  throw new Error(`Unsupported asset type: ${assetType}`);
}
