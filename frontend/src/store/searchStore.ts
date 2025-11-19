import { create } from 'zustand';
import { SearchResponseDTO } from '@/lib/api';

interface SearchState {
  lastSearchQuery: string;
  lastSearchResults: SearchResponseDTO | null;
  setSearchState: (query: string, results: SearchResponseDTO | null) => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  lastSearchQuery: '',
  lastSearchResults: null,
  setSearchState: (query, results) => set({ lastSearchQuery: query, lastSearchResults: results }),
}));
