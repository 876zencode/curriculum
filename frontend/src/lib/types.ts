export interface CanonicalSourceDTO {
  id: string;
  title: string;
  url: string;
  steward: string;
  type: string;
  confidence: number;
  short_summary: string;
}

export interface LearningResourceDTO {
  title: string;
  url: string;
  type: string;
  authority_score: number;
  short_summary: string;
  tier_id?: string;
  asset_type?: string;
  final_score?: number;
  rationale?: string;
}

export interface RankedResourceDTO {
  url: string;
  title: string;
  resource_type: string;
  short_description: string;
  confidence: number;
  pedagogical_quality_score?: number;
  estimated_difficulty?: string;
  learning_level_tags: LearningLevelDTO[];
  reasoning?: string;
}

export interface MetadataDTO {
  type?: string;
  spec_version?: string;
  notes?: string;
}

export interface SourceReferenceDTO {
  sourceId: string;
  url: string;
  snippet?: string;
  short_evidence?: string;
}

export interface PracticeProjectDTO {
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
  outcomes: string[];
}

export interface TopicDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  estimated_hours: number;
  prerequisites: string[];
  outcomes: string[];
  example_exercises: string[];
  helpful_references: SourceReferenceDTO[];
  explainability: string[];
  subtopics: TopicDTO[];
  learning_resources?: LearningResourceDTO[];
}

export interface LearningLevelDTO {
  level: string;
  estimated_hours: number;
  topics: TopicDTO[];
}

export interface CurriculumDTO {
  language: string;
  generated_at: string;
  canonical_sources: CanonicalSourceDTO[];
  overall_learning_path: LearningLevelDTO[];
  core_sources: string[];
  supplemental_sources: string[];
  practice_projects: PracticeProjectDTO[];
  explanation: string;
  model_version: string;
}

export interface LanguageOption {
  slug: string;
  label: string;
}

export interface CurriculumConfig {
  name: string;
  topics?: unknown;
  trustProfiles?: Record<string, unknown>;
  assetScoring?: AssetScoringConfig | null;
  [key: string]: unknown;
}

export interface AssetScoringTier {
  id: string;
  label: string;
  order: number;
  role?: string;
  asset_types?: string[];
  selection_rules?: {
    per_lesson?: {
      min?: number;
      max?: number;
    };
  };
  scoring_model?: {
    dimensions?: Record<
      string,
      {
        description?: string;
        inputs?: string[];
      }
    >;
    weights?: Record<string, number>;
    thresholds?: {
      min_final_score?: number;
    };
  };
  thresholds?: {
    min_final_score?: number;
  };
}

export interface AssetScoringConfig {
  version?: string;
  description?: string;
  tiers?: AssetScoringTier[];
  global_scoring?: {
    normalization?: string;
    final_score_formula?: string;
    tie_breakers?: string[];
  };
}

export type GeneratedAssetType =
  | "summary_article"
  | "audio_lesson"
  | "quiz";

export interface GeneratedAssetDTO {
  id: string;
  language_slug: string;
  topic_id: string;
  asset_type: GeneratedAssetType;
  content: any;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}
