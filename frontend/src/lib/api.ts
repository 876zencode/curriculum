/// <reference types="vite/client" />

import {
  enrichCurriculumWithResources,
  generateCurriculum,
  getCurriculumConfigForLanguage,
  getCurriculumConfigHash,
  getLanguagesFromConfig,
  normalizeLanguageKey,
} from "./curriculumEngine";
import type { CurriculumDTO, LanguageOption } from "./types";
import { isSupabaseConfigured, supabaseClient } from "./supabaseClient";

const curriculumPromises = new Map<string, Promise<CurriculumDTO>>();

type CurriculumCacheRow = {
  language_slug: string;
  curriculum: CurriculumDTO;
  config_hash?: string | null;
  updated_at?: string | null;
};

export type CachedCurriculumMetadata = Pick<CurriculumCacheRow, "language_slug" | "updated_at" | "config_hash">;

async function fetchCachedCurriculumFromSupabase(
  normalizedSlug: string,
  expectedConfigHash?: string | null,
): Promise<CurriculumDTO | null> {
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient
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
    return null;
  }

  return data.curriculum as CurriculumDTO;
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

  const baseCurriculum = await generateCurriculum(normalizedSlug);
  const enriched = await enrichCurriculumWithResources(normalizedSlug, baseCurriculum, trustProfiles);

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

  if (!curriculumPromises.has(normalizedSlug)) {
    const promise = (async () => {
      const configHash = await getCurriculumConfigHash(normalizedSlug);
      const cached = await fetchCachedCurriculumFromSupabase(normalizedSlug, configHash);
      if (cached) {
        return cached;
      }

      return generateAndStoreCurriculum(normalizedSlug, configHash);
    })();

    curriculumPromises.set(normalizedSlug, promise);

    promise.catch(() => {
      curriculumPromises.delete(normalizedSlug);
    });
  }

  const result = await curriculumPromises.get(normalizedSlug)!;
  return result;
}

export async function refreshCurriculum(language: string): Promise<CurriculumDTO> {
  const normalizedSlug = normalizeLanguageKey(language);
  const configHash = await getCurriculumConfigHash(normalizedSlug);

  const promise = generateAndStoreCurriculum(normalizedSlug, configHash);
  curriculumPromises.set(normalizedSlug, promise);
  promise.catch(() => curriculumPromises.delete(normalizedSlug));

  return promise;
}

export async function listCachedCurricula(): Promise<CachedCurriculumMetadata[]> {
  if (!supabaseClient) return [];

  const { data, error } = await supabaseClient
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
