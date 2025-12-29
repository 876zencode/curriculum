/// <reference types="vite/client" />

import {
  enrichCurriculumWithResources,
  generateCurriculum,
  getCurriculumConfigForLanguage,
  getCurriculumConfigHash,
  getLanguagesFromConfig,
  normalizeLanguageKey,
} from "./curriculumEngine";
import type { CurriculumDTO, GeneratedAssetDTO, GeneratedAssetType, LanguageOption, TopicDTO } from "./types";
import { isSupabaseConfigured, supabaseClient, supabaseDataClient } from "./supabaseClient";

const curriculumPromises = new Map<string, Promise<CurriculumDTO>>();

type CurriculumCacheRow = {
  language_slug: string;
  curriculum: CurriculumDTO;
  config_hash?: string | null;
  updated_at?: string | null;
};

type GeneratedAssetCacheRow = GeneratedAssetDTO & { config_hash?: string | null };

export type CachedCurriculumMetadata = Pick<CurriculumCacheRow, "language_slug" | "updated_at" | "config_hash">;

async function fetchCachedCurriculumFromSupabase(
  normalizedSlug: string,
  expectedConfigHash?: string | null,
): Promise<CurriculumDTO | null> {
  if (!supabaseDataClient) return null;

  const { data, error } = await supabaseDataClient
    .from("curricula")
    .select("curriculum, config_hash")
    .eq("language_slug", normalizedSlug)
    .maybeSingle();

  if (error) {
    console.warn("Failed to read curriculum cache from Supabase", error);
    return null;
  }

  if (!data?.curriculum) {
    return null;
  }

  if (expectedConfigHash && data.config_hash && data.config_hash !== expectedConfigHash) {
    console.warn(
      `Config hash mismatch for ${normalizedSlug}. Expected ${expectedConfigHash}, got ${data.config_hash}. Returning cached anyway.`,
    );
  }

  return data.curriculum as CurriculumDTO;
}

async function fetchCachedGeneratedAssetFromSupabase(
  normalizedSlug: string,
  topicId: string,
  assetType: GeneratedAssetType,
  expectedConfigHash?: string | null,
): Promise<GeneratedAssetCacheRow | null> {
  if (!supabaseDataClient) return null;

  let query = supabaseDataClient
    .from("generated_assets")
    .select("*")
    .eq("language_slug", normalizedSlug)
    .eq("topic_id", topicId)
    .eq("asset_type", assetType);

  query = expectedConfigHash ? query.eq("config_hash", expectedConfigHash) : query.is("config_hash", null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.warn("Failed to read generated asset cache from Supabase", error);
    return null;
  }

  return (data as GeneratedAssetCacheRow) ?? null;
}

async function upsertCurriculumCache(
  normalizedSlug: string,
  curriculum: CurriculumDTO,
  configHash?: string | null,
): Promise<void> {
  if (!supabaseClient) return;

  const { error } = await supabaseClient
    .from("curricula")
    .upsert({
      language_slug: normalizedSlug,
      curriculum,
      config_hash: configHash ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.warn("Failed to persist curriculum cache to Supabase", error);
  }
}

async function generateAndStoreCurriculum(
  normalizedSlug: string,
  configHash?: string | null,
): Promise<CurriculumDTO> {
  const config = await getCurriculumConfigForLanguage(normalizedSlug);
  const trustProfiles =
    (config?.trustProfiles as any)?.trustProfiles ??
    (config?.trustProfiles as Record<string, unknown> | undefined) ??
    undefined;
  const assetScoring = (config?.assetScoring as any) ?? undefined;

  const baseCurriculum = await generateCurriculum(normalizedSlug);
  const enriched = await enrichCurriculumWithResources(
    normalizedSlug,
    baseCurriculum,
    trustProfiles,
    assetScoring,
  );

  if (isSupabaseConfigured) {
    await upsertCurriculumCache(normalizedSlug, enriched, configHash);
  }

  return enriched;
}

export async function getLanguages(): Promise<LanguageOption[]> {
  const [configLanguages, cachedCurricula] = await Promise.all([
    getLanguagesFromConfig(),
    listCachedCurricula().catch(() => [] as CachedCurriculumMetadata[]),
  ]);

  const labelBySlug = new Map(configLanguages.map((lang) => [lang.slug, lang.label]));
  const seen = new Set<string>();
  const languages: LanguageOption[] = [];

  cachedCurricula.forEach((row) => {
    const slug = normalizeLanguageKey(row.language_slug);
    if (seen.has(slug)) return;
    languages.push({ slug, label: labelBySlug.get(slug) ?? slug });
    seen.add(slug);
  });

  configLanguages.forEach((lang) => {
    if (seen.has(lang.slug)) return;
    languages.push(lang);
    seen.add(lang.slug);
  });

  return languages;
}

export async function getCurriculum(language: string): Promise<CurriculumDTO> {
  const normalizedSlug = normalizeLanguageKey(language);

  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured; cannot load curriculum.");
  }

  if (!curriculumPromises.has(normalizedSlug)) {
    const promise = (async () => {
      const configHash = await getCurriculumConfigHash(normalizedSlug);
      const cached = await fetchCachedCurriculumFromSupabase(normalizedSlug, configHash);
      if (!cached) {
        throw new Error("Curriculum not cached. Please refresh it from the Cache Admin page.");
      }
      return cached;
    })();

    curriculumPromises.set(normalizedSlug, promise);

    promise.catch(() => {
      curriculumPromises.delete(normalizedSlug);
    });
  }

  return curriculumPromises.get(normalizedSlug)!;
}

export function findTopicInCurriculum(curriculum: CurriculumDTO, topicId: string): TopicDTO | null {
  const search = (topic: TopicDTO): TopicDTO | null => {
    if (topic.id === topicId) return topic;
    for (const subtopic of topic.subtopics ?? []) {
      const match = search(subtopic);
      if (match) return match;
    }
    return null;
  };

  for (const level of curriculum.overall_learning_path ?? []) {
    for (const topic of level.topics ?? []) {
      const match = search(topic);
      if (match) return match;
    }
  }

  console.warn(`Topic with id "${topicId}" not found in curriculum ${curriculum.language}`);
  return null;
}

export async function refreshCurriculum(language: string): Promise<CurriculumDTO> {
  const normalizedSlug = normalizeLanguageKey(language);
  const configHash = await getCurriculumConfigHash(normalizedSlug);

  const promise = generateAndStoreCurriculum(normalizedSlug, configHash);
  curriculumPromises.set(normalizedSlug, promise);
  promise.catch(() => curriculumPromises.delete(normalizedSlug));

  return promise;
}

export async function getGeneratedAssetForTopic(
  languageSlug: string,
  topicId: string,
  assetType: GeneratedAssetType,
): Promise<GeneratedAssetDTO> {
  const normalizedSlug = normalizeLanguageKey(languageSlug);
  const configHash = await getCurriculumConfigHash(normalizedSlug);

  const cached = await fetchCachedGeneratedAssetFromSupabase(normalizedSlug, topicId, assetType, configHash);
  if (cached) {
    return {
      ...cached,
      audio_url: cached.audio_url ?? undefined,
      created_at: cached.created_at ?? new Date().toISOString(),
      updated_at: cached.updated_at ?? new Date().toISOString(),
    };
  }

  throw new Error("Generated asset not cached. Please refresh it from the Cache Admin page.");
}

export async function listCachedCurricula(): Promise<CachedCurriculumMetadata[]> {
  if (!supabaseDataClient) return [];

  const { data, error } = await supabaseDataClient
    .from("curricula")
    .select("language_slug, updated_at, config_hash")
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("Failed to list cached curricula from Supabase", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    language_slug: normalizeLanguageKey(row.language_slug),
    updated_at: row.updated_at,
    config_hash: row.config_hash,
  }));
}
