import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SourceDTO } from '@/lib/api';

interface SavedSourcesState {
  savedSources: { [url: string]: SourceDTO };
  addItem: (source: SourceDTO) => void;
  removeItem: (url: string) => void;
  isSourceSaved: (url: string) => boolean;
}

export const useSavedSourcesStore = create<SavedSourcesState>()(
  persist(
    (set, get) => ({
      savedSources: {},
      addItem: (source) =>
        set((state) => ({
          savedSources: {
            ...state.savedSources,
            [source.url]: source,
          },
        })),
      removeItem: (url) =>
        set((state) => {
          const newSources = { ...state.savedSources };
          delete newSources[url];
          return { savedSources: newSources };
        }),
      isSourceSaved: (url) => Object.prototype.hasOwnProperty.call(get().savedSources, url),
    }),
    {
      name: 'saved-sources-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
