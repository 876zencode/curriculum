/// <reference types="vite/client" />

// New DTOs corresponding to backend definitions
export interface CanonicalSourceDTO {
    id: string; // Unique identifier for the source
    title: string;
    url: string;
    steward: string; // e.g., "Oracle", "MDN"
    type: string; // e.g., "Official Docs", "Tutorial"
    confidence: number; // LLM's confidence
    short_summary: string; // AI-generated brief description
}

export interface ConsolidatedSourcesDTO {
    language: string;
    headline: string; // e.g., "Java — Canonical Learning Hub"
    sources: CanonicalSourceDTO[];
}

export interface LearningLevelDTO {
    level: string; // "Beginner", "Intermediate", "Advanced", "Expert"
    estimated_hours: number; // Total estimated hours for this level
    topics: TopicDTO[];
}

export interface SourceReferenceDTO {
    sourceId: string; // Refers to CanonicalSourceDTO.id
    url: string; // Direct URL to the relevant section
    snippet?: string; // Short text excerpt from the source
    short_evidence?: string; // AI-generated short evidence line
}

export interface PracticeProjectDTO {
    title: string;
    description: string;
    difficulty: string; // "Beginner", "Intermediate"
    estimated_hours: number;
    outcomes: string[]; // Skills gained
}

export interface TopicDTO {
    id: string; // Unique identifier for the topic
    title: string;
    description: string;
    order: number; // Learning order within level
    estimated_hours: number;
    prerequisites: string[]; // List of topic IDs
    outcomes: string[]; // Measurable skills
    example_exercises: string[];
    helpful_references: SourceReferenceDTO[];
    explainability: string[]; // Which sources influenced this
    subtopics: TopicDTO[]; // Recursive
}

export interface CurriculumDTO {
    language: string;
    generated_at: string; // LocalDateTime as string
    overall_learning_path: LearningLevelDTO[];
    core_sources: string[]; // Explicit field for core sources
    supplemental_sources: string[]; // Explicit field for supplemental sources
    practice_projects: PracticeProjectDTO[]; // Explicit field for practice projects
    explanation: string; // How LLM consolidated
    model_version: string;
}

export interface SourceBreakdownDTO {
    sourceId: string; // Corresponds to CanonicalSourceDTO.id
    title: string;
    url: string;
    summary: string; // AI-generated summary of this source's content
    extracted_topics: TopicDTO[]; // Topics directly extracted from this source
    references: SourceReferenceDTO[]; // References found within this source
}

// Added DTOs
export interface LearningLevelTag {
  level: string;
}

export interface RankedResourceDTO {
  url: string;
  title: string;
  resource_type: string;
  short_description: string;
  confidence: number;
  pedagogical_quality_score?: number;
  estimated_difficulty?: string;
  learning_level_tags: LearningLevelTag[];
  reasoning: string;
}

export interface MetadataDTO {
    type?: string;
    spec_version?: string;
    notes?: string;
}

// Helper DTO for the combined /api/language/{slug} response
export interface LanguageOverviewResponse {
    consolidatedSources: ConsolidatedSourcesDTO;
    curriculum: CurriculumDTO;
}


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// New API call functions for LanguageController

export async function getLanguageOverview(slug: string): Promise<LanguageOverviewResponse> {
    const response = await fetch(`${API_BASE_URL}/language/${slug}`);
    if (!response.ok) {
        throw new Error(`Error fetching language overview for ${slug}`);
    }
    return response.json();
}

export async function getLanguageSources(slug: string): Promise<ConsolidatedSourcesDTO> {
    const response = await fetch(`${API_BASE_URL}/language/${slug}/sources`);
    if (!response.ok) {
        throw new Error(`Error fetching language sources for ${slug}`);
    }
    return response.json();
}

export async function getLanguageCurriculum(slug: string): Promise<CurriculumDTO> {
    const response = await fetch(`${API_BASE_URL}/language/${slug}/curriculum`);
    if (!response.ok) {
        throw new Error(`Error fetching language curriculum for ${slug}`);
    }
    return response.json();
}

export async function getSourceBreakdown(slug: string, sourceId: string): Promise<SourceBreakdownDTO> {
    const response = await fetch(`${API_BASE_URL}/language/${slug}/sources/${sourceId}/breakdown`);
    if (!response.ok) {
        throw new Error(`Error fetching source breakdown for ${sourceId} in ${slug}`);
    }
    return response.json();
}

export async function refreshLanguageCurriculum(slug: string): Promise<ConsolidatedSourcesDTO> {
    const response = await fetch(`${API_BASE_URL}/language/${slug}/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Error refreshing curriculum for ${slug}`);
    }
    return response.json();
}
