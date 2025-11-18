export interface SourceDTO {
  title: string;
  url: string;
  authorityScore: number;
  reason: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function searchSources(query: string): Promise<SourceDTO[]> {
  const response = await fetch(`${API_BASE_URL}/sources/search?query=${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function saveSource(source: SourceDTO): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sources/save`, {
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
  const response = await fetch(`${API_BASE_URL}/sources/saved`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}
