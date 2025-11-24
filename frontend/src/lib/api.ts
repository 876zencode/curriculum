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

export interface LearningResourceDTO {
    title: string;
    url: string;
    type: string; // e.g., "Documentation", "Video", "Article", "GitHub", "Book"
    authority_score: number;
    short_summary: string;
}

export interface RankedResourceDTO {
    url: string;
    title: string;
    resource_type: string;
    short_description: string;
    confidence: number;
    pedagogical_quality_score?: number;
    estimated_difficulty?: string;
    learning_level_tags: { level: string }[]; // Assuming this structure based on usage
    reasoning?: string;
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
    learning_resources?: LearningResourceDTO[]; // Curated learning materials for this topic
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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

export async function getLanguages(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/curriculum/metadata`);
    if (!response.ok) {
        throw new Error("Error fetching languages");
    }
    return response.json();
}

export async function getCanonicalSources(language: string): Promise<CanonicalSourceDTO[]> {
    const response = await fetch(`${API_BASE_URL}/curriculum/${language}/canonical-sources`);
    if (!response.ok) {
        throw new Error(`Error fetching canonical sources for ${language}`);
    }
    return response.json();
}

export async function getCurriculum(language: string): Promise<CurriculumDTO> {
    const response = await fetch(`${API_BASE_URL}/curriculum/${language}/curriculum`);
    if (!response.ok) {
        throw new Error(`Error fetching curriculum for ${language}`);
    }
    return response.json();
}

