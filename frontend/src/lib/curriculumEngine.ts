import type {
  CanonicalSourceDTO,
  CurriculumConfig,
  CurriculumDTO,
  LanguageOption,
  LearningLevelDTO,
  LearningResourceDTO,
  PracticeProjectDTO,
  AssetScoringConfig,
  SourceReferenceDTO,
  TopicDTO,
} from "./types";

const CURRICULUM_PROMPT_TEMPLATE = `You are an expert in curriculum design and software engineering. Your task is to generate a comprehensive and structured curriculum for the given programming language or technology, based on the provided JSON data.

Phase 1 (this call): generate the main topics only. Do NOT generate subtopics—set "subtopics": [] for every topic. Outcomes must be structured, because subtopics will be generated in a follow-up LLM call from these outcomes.

The output should be a single JSON object that strictly adheres to the following JSON structure. All fields must be present, even if empty (e.g., empty array [] or null).

\`\`\`json
{
  "language": "string",
  "generated_at": "string (ISO 8601 format, e.g., '2023-10-27T10:00:00')",
  "overall_learning_path": [
    {
      "level": "string (e.g., 'Beginner', 'Intermediate', 'Advanced', 'Expert')",
      "estimated_hours": "number (total estimated hours for this level)",
      "topics": [
        {
          "id": "string (unique identifier for the topic)",
          "title": "string",
          "description": "string",
          "order": "number (recommended learning order within its level)",
          "estimated_hours": "number",
          "prerequisites": ["string (list of topic IDs that are prerequisites)"],
          "outcomes": [
            {
              "id": "string (unique id for the outcome)",
              "title": "string (short, student-friendly statement of the outcome)",
              "description": "string (1-3 sentences describing the capability)",
              "success_criteria": "string (how to verify the learner achieved it; optional)",
              "assessment_idea": "string (short idea for a quick check or exercise; optional)"
            }
          ],
          "example_exercises": ["string"],
          "helpful_references": [
            {
              "source_id": "string (refers to CanonicalSourceDTO.id)",
              "url": "string (direct URL to the relevant section if possible)",
              "snippet": "string (short text excerpt from the source)",
              "short_evidence": "string (AI-generated short evidence line)"
            }
          ],
          "explainability": ["string (which input sources influenced this topic)"],
          "subtopics": []
        }
      ]
    }
  ],
  "canonical_sources": [
    {
      "id": "string (unique identifier for the source, e.g., a slug derived from the URL or a UUID)",
      "title": "string",
      "url": "string",
      "steward": "string (e.g., 'Oracle', 'MDN', 'Spring')",
      "type": "string (e.g., 'Official Docs', 'Tutorial', 'API Reference')",
      "confidence": "number (LLM's confidence in this source's authority)",
      "short_summary": "string (AI-generated brief description)"
    }
  ],
  "core_sources": ["string"],
  "supplemental_sources": ["string"],
  "practice_projects": [
    {
      "title": "string",
      "description": "string",
      "difficulty": "string (e.g., 'Beginner', 'Intermediate')",
      "estimated_hours": "number",
      "outcomes": ["string (skills gained from completing this project)"]
    }
  ],
  "explanation": "string (how the LLM consolidated sources and decided ordering)",
  "model_version": "string (LLM model version used)"
}
\`\`\`

Here is the JSON data:
{curriculumData}`;

const SUBTOPIC_PROMPT_TEMPLATE = `You are an expert curriculum designer. Given a main topic and its outcomes, generate only the subtopics for that topic.

Rules:
- Derive subtopics directly from the topic's outcomes. Each outcome should be reflected as one or more concise subtopics.
- Subtopic titles must be short (≈2–6 words), concrete, and student-friendly.
- Descriptions should be 1–3 sentences clarifying scope and expectation.
- Include structured outcomes for each subtopic (same shape as main outcomes).
- Do not include resources/assets here; those are generated separately.
- Do not include any additional levels beyond subtopics; do not include practice projects here.

Return JSON with:
{
  "topic_id": "string",
  "subtopics": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "order": "number",
      "estimated_hours": "number",
      "prerequisites": ["string"],
      "outcomes": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "success_criteria": "string (optional)",
          "assessment_idea": "string (optional)"
        }
      ],
      "example_exercises": ["string"],
      "helpful_references": [
        {
          "source_id": "string",
          "url": "string",
          "snippet": "string",
          "short_evidence": "string"
        }
      ],
      "explainability": ["string"],
      "subtopics": []
    }
  ]
}

Context:
Language: {language}
Topic JSON:
{topicData}`;

let curriculumConfigCache: CurriculumConfig[] | null = null;
let curriculumConfigPromise: Promise<CurriculumConfig[]> | null = null;
const baseCurriculumCache = new Map<string, CurriculumDTO>();
const enrichedCurriculumCache = new Map<string, CurriculumDTO>();
const configHashCache = new Map<string, string>();
const LOCAL_STORAGE_NAMESPACE = "curriculumCache";

export async function fetchCurriculumConfig(): Promise<CurriculumConfig[]> {
  if (curriculumConfigCache) {
    return curriculumConfigCache;
  }
  if (curriculumConfigPromise) {
    return curriculumConfigPromise;
  }
  curriculumConfigPromise = (async () => {
    const curriculumDataUrl = import.meta.env.VITE_CURRICULUM_DATA_URL;
    if (!curriculumDataUrl) {
      throw new Error("VITE_CURRICULUM_DATA_URL is not configured.");
    }
    const response = await fetch(curriculumDataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch curriculum config: ${response.status} ${response.statusText}`);
    }
    const raw = await response.json();
    const normalized = Array.isArray(raw)
      ? raw
      : typeof raw === "object" && raw !== null
        ? [raw]
        : [];
    curriculumConfigCache = normalized as CurriculumConfig[];
    return curriculumConfigCache;
  })();
  return curriculumConfigPromise;
}

export function normalizeLanguageKey(raw: string): string {
  const lowered = raw.toLowerCase();
  const stripped = lowered
    .replace(/developer path/g, "")
    .replace(/engineer path/g, "")
    .replace(/developer/g, "")
    .replace(/engineer/g, "")
    .replace(/frontend/g, "")
    .replace(/backend/g, "")
    .replace(/fullstack/g, "")
    .replace(/basics/g, "")
    .replace(/learning path/g, "");
  return stripped.replace(/[^a-z0-9+]+/g, "-").replace(/^-+|-+$/g, "");
}

function getConfigIdentity(config: CurriculumConfig): string {
  const candidate =
    (typeof (config as any)?.language_slug === "string" && (config as any).language_slug) ||
    (typeof (config as any)?.language === "string" && (config as any).language) ||
    (typeof (config as any)?.subject === "string" && (config as any).subject) ||
    (typeof (config as any)?.slug === "string" && (config as any).slug) ||
    (typeof (config as any)?.id === "string" && (config as any).id) ||
    (typeof config?.name === "string" && config.name) ||
    "";
  return candidate.trim();
}

function hashForSlug(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(36).slice(0, 6);
}

function buildConfigSlugIndex(configs: CurriculumConfig[]): Map<string, CurriculumConfig> {
  const index = new Map<string, CurriculumConfig>();
  const seen = new Set<string>();

  configs.forEach((entry) => {
    const identity = getConfigIdentity(entry);
    if (!identity) return;
    const baseSlug = normalizeLanguageKey(identity);
    if (!baseSlug) return;

    let slug = baseSlug;
    if (seen.has(slug)) {
      slug = `${baseSlug}-${hashForSlug(identity)}`;
      let counter = 1;
      while (seen.has(slug)) {
        slug = `${baseSlug}-${hashForSlug(`${identity}-${counter}`)}`;
        counter += 1;
      }
    }

    seen.add(slug);
    index.set(slug, entry);
  });

  return index;
}

export async function getLanguagesFromConfig(): Promise<LanguageOption[]> {
  const configs = await fetchCurriculumConfig();
  const index = buildConfigSlugIndex(configs);
  return Array.from(index.entries()).map(([slug, entry]) => {
    const label = typeof entry?.name === "string" && entry.name.trim() ? entry.name : slug;
    return { slug, label };
  });
}

export async function getCurriculumConfigForLanguage(slug: string): Promise<CurriculumConfig | null> {
  const normalized = normalizeLanguageKey(slug);
  const configs = await fetchCurriculumConfig();
  const index = buildConfigSlugIndex(configs);
  return index.get(normalized) ?? null;
}

export async function getCurriculumConfigHash(slug: string): Promise<string | null> {
  const config = await getCurriculumConfigForLanguage(slug);
  if (!config) {
    return null;
  }
  return getConfigHash(config);
}

export async function callOpenAiChatJSON(prompt: string): Promise<any> {
  const proxyUrl = import.meta.env.VITE_LLM_PROXY_URL || "/api/llm-proxy";
  const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-5.1";
  if (!proxyUrl) {
    throw new Error("VITE_LLM_PROXY_URL is not configured.");
  }

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM proxy call failed: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return extractJson(content);
}

export async function generateCurriculum(languageSlug: string): Promise<CurriculumDTO> {
  const normalizedSlug = normalizeLanguageKey(languageSlug);
  const config = await getCurriculumConfigForLanguage(normalizedSlug);
  if (!config) {
    throw new Error(`No curriculum config found for language "${languageSlug}".`);
  }

  const topicsPayload =
    (config as any).topics?.topics ??
    (config as any).topics ??
    config;
  const topicsJson = JSON.stringify(topicsPayload, null, 2);
  const configHash = await getConfigHash(config);
  configHashCache.set(normalizedSlug, configHash);
  const cacheKey = `${normalizedSlug}:${configHash}:base`;

  const cached = baseCurriculumCache.get(cacheKey) ?? readPersistedCurriculum(cacheKey);
  if (cached) {
    baseCurriculumCache.set(cacheKey, cached);
    return cached;
  }

  const prompt = CURRICULUM_PROMPT_TEMPLATE.replace("{curriculumData}", topicsJson);
  const raw = await callOpenAiChatJSON(prompt);
  const baseCurriculum = normalizeCurriculum(raw, normalizedSlug);

  const hydratedLevels: LearningLevelDTO[] = [];
  for (const level of baseCurriculum.overall_learning_path ?? []) {
    const hydratedTopics: TopicDTO[] = [];
    for (const topic of level.topics ?? []) {
      hydratedTopics.push(await generateSubtopicsForTopic(normalizedSlug, topic));
    }
    hydratedLevels.push({ ...level, topics: hydratedTopics });
  }

  const curriculum: CurriculumDTO = { ...baseCurriculum, overall_learning_path: hydratedLevels };
  persistCurriculum(cacheKey, curriculum, baseCurriculumCache);
  return curriculum;
}

export async function generateSubtopicsForTopic(
  language: string,
  topic: TopicDTO,
): Promise<TopicDTO> {
  const topicData = JSON.stringify({ language, topic }, null, 2);
  const prompt = SUBTOPIC_PROMPT_TEMPLATE
    .replace("{language}", language)
    .replace("{topicData}", topicData);

  const raw = await callOpenAiChatJSON(prompt);
  const subtopicsRaw = raw?.subtopics ?? raw?.topic?.subtopics ?? raw?.items ?? [];
  const subtopics = Array.isArray(subtopicsRaw) ? subtopicsRaw.map(normalizeTopic) : [];
  return { ...topic, subtopics };
}

export async function generateLearningResources(
  _language: string,
  _topicPath: string[],
  _subtopicTitle: string,
  _trustProfile?: Record<string, unknown>,
  _assetScoring?: AssetScoringConfig | null,
): Promise<LearningResourceDTO[]> {
  return [];
}

export async function enrichCurriculumWithResources(
  languageSlug: string,
  curriculum: CurriculumDTO,
  trustProfiles?: Record<string, unknown>,
  assetScoring?: AssetScoringConfig | null,
): Promise<CurriculumDTO> {
  const normalizedSlug = normalizeLanguageKey(languageSlug);
  const config = trustProfiles || assetScoring ? null : await getCurriculumConfigForLanguage(normalizedSlug);
  const effectiveTrustProfiles = trustProfiles
    ?? (config?.trustProfiles as any)?.trustProfiles
    ?? (config?.trustProfiles as Record<string, unknown> | undefined)
    ?? {};
  const effectiveAssetScoring: AssetScoringConfig | null =
    assetScoring ?? (config?.assetScoring as AssetScoringConfig | null) ?? null;

  const configHash =
    configHashCache.get(normalizedSlug) ??
    (config ? await getConfigHash(config) : await computeHash(JSON.stringify(curriculum)));
  const cacheKey = `${normalizedSlug}:${configHash}:enriched`;

  const cached = enrichedCurriculumCache.get(cacheKey) ?? readPersistedCurriculum(cacheKey);
  if (cached) {
    enrichedCurriculumCache.set(cacheKey, cached);
    return cached;
  }

  const processTopic = async (topic: TopicDTO, parentTitles: string[]): Promise<TopicDTO> => {
    const topicPath = [...parentTitles, topic.title].filter(Boolean);
    const processedSubtopics: TopicDTO[] = [];
    for (const subtopic of topic.subtopics ?? []) {
      processedSubtopics.push(await processTopic(subtopic, topicPath));
    }

    const shouldGenerateForThisNode = processedSubtopics.length === 0;
    const resources = shouldGenerateForThisNode
      ? await generateLearningResources(
          normalizedSlug,
          topicPath,
          topic.title,
          effectiveTrustProfiles,
          effectiveAssetScoring,
        )
      : [];

    return {
      ...topic,
      subtopics: processedSubtopics,
      learning_resources: resources,
    };
  };

  const updatedLevels: LearningLevelDTO[] = [];
  for (const level of curriculum.overall_learning_path ?? []) {
    const updatedTopics: TopicDTO[] = [];
    for (const topic of level.topics ?? []) {
      updatedTopics.push(await processTopic(topic, []));
    }
    updatedLevels.push({ ...level, topics: updatedTopics });
  }

  const enrichedCurriculum: CurriculumDTO = { ...curriculum, overall_learning_path: updatedLevels };
  persistCurriculum(cacheKey, enrichedCurriculum, enrichedCurriculumCache);
  return enrichedCurriculum;
}

async function computeHash(value: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

async function getConfigHash(config: CurriculumConfig): Promise<string> {
  const payload = {
    topics: (config as any).topics?.topics ?? (config as any).topics ?? config?.topics,
    trustProfiles: config?.trustProfiles ?? null,
    assetScoring: (config as any).assetScoring ?? null,
  };
  return computeHash(JSON.stringify(payload));
}

function extractJson(content: string): any {
  const cleaned = content.trim();
  if (!cleaned) return {};

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Continue to fallbacks
  }

  const fenceStripped = cleaned
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(fenceStripped);
  } catch (error) {
    // Continue to fallbacks
  }

  const objectStart = fenceStripped.indexOf("{");
  const objectEnd = fenceStripped.lastIndexOf("}");
  const arrayStart = fenceStripped.indexOf("[");
  const arrayEnd = fenceStripped.lastIndexOf("]");

  if (objectStart !== -1 && objectEnd > objectStart) {
    const candidate = fenceStripped.slice(objectStart, objectEnd + 1);
    try {
      return JSON.parse(candidate);
    } catch (error) {
      // Continue
    }
  }

  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    const candidate = fenceStripped.slice(arrayStart, arrayEnd + 1);
    try {
      return JSON.parse(candidate);
    } catch (error) {
      // Continue
    }
  }

  return {};
}

function normalizeCurriculum(raw: any, languageSlug: string): CurriculumDTO {
  const canonicalSources = Array.isArray(raw?.canonical_sources ?? raw?.canonicalSources)
    ? (raw.canonical_sources ?? raw.canonicalSources).map(normalizeCanonicalSource)
    : [];

  const learningPathRaw = raw?.overall_learning_path ?? raw?.overallLearningPath ?? [];
  const learningPath: LearningLevelDTO[] = Array.isArray(learningPathRaw)
    ? learningPathRaw.map(normalizeLearningLevel)
    : [];

  const practiceProjectsRaw = raw?.practice_projects ?? raw?.practiceProjects ?? [];
  const practiceProjects: PracticeProjectDTO[] = Array.isArray(practiceProjectsRaw)
    ? practiceProjectsRaw.map(normalizePracticeProject)
    : [];

  return {
    language: typeof raw?.language === "string" ? raw.language : languageSlug,
    generated_at:
      typeof raw?.generated_at === "string"
        ? raw.generated_at
        : typeof raw?.generatedAt === "string"
          ? raw.generatedAt
          : new Date().toISOString(),
    canonical_sources: canonicalSources,
    overall_learning_path: learningPath,
    core_sources: Array.isArray(raw?.core_sources ?? raw?.coreSources) ? (raw.core_sources ?? raw.coreSources) : [],
    supplemental_sources: Array.isArray(raw?.supplemental_sources ?? raw?.supplementalSources)
      ? (raw.supplemental_sources ?? raw.supplementalSources)
      : [],
    practice_projects: practiceProjects,
    explanation: typeof raw?.explanation === "string" ? raw.explanation : "",
    model_version: typeof raw?.model_version === "string"
      ? raw.model_version
      : typeof raw?.modelVersion === "string"
        ? raw.modelVersion
        : "",
  };
}

function normalizeLearningLevel(raw: any): LearningLevelDTO {
  const topicsRaw = raw?.topics ?? [];
  const topics = Array.isArray(topicsRaw) ? topicsRaw.map(normalizeTopic) : [];
  return {
    level: typeof raw?.level === "string" ? raw.level : "",
    estimated_hours: Number(raw?.estimated_hours ?? raw?.estimatedHours ?? 0),
    topics,
  };
}

function normalizeTopic(raw: any): TopicDTO {
  const subtopicsRaw = raw?.subtopics ?? [];
  const subtopics = Array.isArray(subtopicsRaw) ? subtopicsRaw.map(normalizeTopic) : [];
  const referencesRaw = raw?.helpful_references ?? raw?.helpfulReferences ?? [];
  const references = Array.isArray(referencesRaw) ? referencesRaw.map(normalizeSourceReference) : [];
  const resourcesRaw = raw?.learning_resources ?? raw?.learningResources ?? [];
  const resources = Array.isArray(resourcesRaw) ? resourcesRaw.map(normalizeLearningResource) : [];

  return {
    id: typeof raw?.id === "string" ? raw.id : crypto.randomUUID?.() ?? String(Math.random()),
    title: typeof raw?.title === "string" ? raw.title : "",
    description: typeof raw?.description === "string" ? raw.description : "",
    order: Number(raw?.order ?? 0),
    estimated_hours: Number(raw?.estimated_hours ?? raw?.estimatedHours ?? 0),
    prerequisites: Array.isArray(raw?.prerequisites) ? raw.prerequisites : [],
    outcomes: Array.isArray(raw?.outcomes) ? raw.outcomes : [],
    example_exercises: Array.isArray(raw?.example_exercises ?? raw?.exampleExercises)
      ? (raw.example_exercises ?? raw.exampleExercises)
      : [],
    helpful_references: references,
    explainability: Array.isArray(raw?.explainability) ? raw.explainability : [],
    subtopics,
    learning_resources: resources,
  };
}

function normalizeCanonicalSource(raw: any): CanonicalSourceDTO {
  return {
    id: typeof raw?.id === "string" ? raw.id : "",
    title: typeof raw?.title === "string" ? raw.title : "",
    url: typeof raw?.url === "string" ? raw.url : "",
    steward: typeof raw?.steward === "string" ? raw.steward : "",
    type: typeof raw?.type === "string" ? raw.type : "",
    confidence: Number(raw?.confidence ?? 0),
    short_summary:
      typeof raw?.short_summary === "string"
        ? raw.short_summary
        : typeof raw?.shortSummary === "string"
          ? raw.shortSummary
          : "",
  };
}

function normalizeSourceReference(raw: any): SourceReferenceDTO {
  return {
    sourceId: typeof raw?.sourceId === "string" ? raw.sourceId : typeof raw?.source_id === "string" ? raw.source_id : "",
    url: typeof raw?.url === "string" ? raw.url : "",
    snippet: typeof raw?.snippet === "string" ? raw.snippet : undefined,
    short_evidence:
      typeof raw?.short_evidence === "string"
        ? raw.short_evidence
        : typeof raw?.shortEvidence === "string"
          ? raw.shortEvidence
          : undefined,
  };
}

function normalizeLearningResource(raw: any): LearningResourceDTO {
  return {
    title: typeof raw?.title === "string" ? raw.title : "",
    url: typeof raw?.url === "string" ? raw.url : "",
    type: typeof raw?.type === "string" ? raw.type : "",
    authority_score: Number(raw?.authority_score ?? raw?.authorityScore ?? 0),
    final_score: Number(raw?.final_score ?? raw?.finalScore ?? raw?.authority_score ?? raw?.authorityScore ?? 0),
    tier_id: typeof raw?.tier_id === "string" ? raw.tier_id : typeof raw?.tierId === "string" ? raw.tierId : undefined,
    asset_type:
      typeof raw?.asset_type === "string"
        ? raw.asset_type
        : typeof raw?.assetType === "string"
          ? raw.assetType
          : undefined,
    rationale:
      typeof raw?.rationale === "string"
        ? raw.rationale
        : typeof raw?.reason === "string"
          ? raw.reason
          : undefined,
    short_summary:
      typeof raw?.short_summary === "string"
        ? raw.short_summary
        : typeof raw?.shortSummary === "string"
          ? raw.shortSummary
          : "",
  };
}

function normalizePracticeProject(raw: any): PracticeProjectDTO {
  return {
    title: typeof raw?.title === "string" ? raw.title : "",
    description: typeof raw?.description === "string" ? raw.description : "",
    difficulty: typeof raw?.difficulty === "string" ? raw.difficulty : "",
    estimated_hours: Number(raw?.estimated_hours ?? raw?.estimatedHours ?? 0),
    outcomes: Array.isArray(raw?.outcomes) ? raw.outcomes : [],
  };
}

function persistCurriculum(
  key: string,
  curriculum: CurriculumDTO,
  cache: Map<string, CurriculumDTO> = baseCurriculumCache,
) {
  cache.set(key, curriculum);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(`${LOCAL_STORAGE_NAMESPACE}:${key}`, JSON.stringify(curriculum));
    }
  } catch (error) {
    // Ignore storage errors
  }
}

function readPersistedCurriculum(key: string): CurriculumDTO | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(`${LOCAL_STORAGE_NAMESPACE}:${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as CurriculumDTO;
  } catch (error) {
    return null;
  }
}
