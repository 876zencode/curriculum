export interface MetadataDTO {
  type: string;
  spec_version?: string; // Optional as per the example
  notes?: string;       // Optional as per the example
}

// New DTO for Learning Level Tags
export interface LearningLevelTagDTO {
  level: string; // e.g., "Beginner", "Intermediate", "Advanced"
  description?: string;
}

// New DTO for Curriculum Topics (recursive)
export interface CurriculumTopicDTO {
  name: string;
  summary: string;
  order: number;
  category: string; // e.g., "Fundamentals", "Tooling", "Ecosystem", "Best Practices", "Advanced Concepts"
  subtopics: CurriculumTopicDTO[]; // Recursive
}

// Renamed and updated SourceDTO to RankedResourceDTO
export interface RankedResourceDTO {
  title: string;
  url: string;
  is_official: boolean;
  confidence: number;
  reasoning: string; // Why this source is recommended
  metadata?: MetadataDTO; // Existing metadata, can be augmented or specific to type
  resource_type: string; // e.g., "Official Documentation", "Community Tutorial"
  short_description: string;
  learning_level_tags: LearningLevelTagDTO[];
  skill_outcomes: string[];
  estimated_difficulty: string; // e.g., "Beginner", "Intermediate", "Advanced"
  pedagogical_quality_score: number;
  curriculum_extract: CurriculumTopicDTO[];
}

// Renamed and updated LLMSearchResponse to SearchResponseDTO
export interface SearchResponseDTO {
  query: string;
  results: RankedResourceDTO[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function searchSources(query: string): Promise<SearchResponseDTO> {
  const response = await fetch(`${API_BASE_URL}/search?query=${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

// Updated saveSource to use RankedResourceDTO
export async function saveSource(source: RankedResourceDTO): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/saved`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(source),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}

// Updated getSavedSources to return RankedResourceDTO[]
export async function getSavedSources(): Promise<RankedResourceDTO[]> {
  const response = await fetch(`${API_BASE_URL}/saved`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}
