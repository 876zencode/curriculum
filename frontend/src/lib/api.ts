export interface MetadataDTO {
  type: string;
  spec_version?: string; // Optional as per the example
  notes?: string;       // Optional as per the example
}

export interface SourceDTO {
  title: string;
  url: string;
  is_official: boolean;
  confidence: number;
  reasoning: string;
  metadata: MetadataDTO;
}

export interface LLMSearchResponse {
  query: string;
  results: SourceDTO[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function searchSources(query: string): Promise<LLMSearchResponse> {
  // New endpoint: GET /api/search?query={q}
  const response = await fetch(`${API_BASE_URL}/search?query=${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function saveSource(source: SourceDTO): Promise<void> {
  // New endpoint: POST /api/saved
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

export async function getSavedSources(): Promise<SourceDTO[]> {
  // New endpoint: GET /api/saved
  const response = await fetch(`${API_BASE_URL}/saved`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}
