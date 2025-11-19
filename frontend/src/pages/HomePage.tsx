import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSources, saveSource, SourceDTO, LLMSearchResponse } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResultCard } from "@/components/ResultCard";
import { useSavedSourcesStore } from "@/store/savedSourcesStore"; // Import the Zustand store
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function HomePage() {
  const [inputQuery, setInputQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<LLMSearchResponse, Error>({
    queryKey: ["search", searchQuery],
    queryFn: () => searchSources(searchQuery),
    enabled: !!searchQuery, // Only run query if searchQuery is not empty
  });

  const { savedSources, addItem, removeItem, isSourceSaved } = useSavedSourcesStore();

  // Mutation for saving to backend (if desired, though current spec only mentions local storage)
  // This is kept for consistency with the existing API client but the primary "save" is to Zustand.
  const saveToBackendMutation = useMutation({
    mutationFn: saveSource,
    onSuccess: () => {
      // Invalidate the savedSources cache if we were fetching them from backend
      queryClient.invalidateQueries({ queryKey: ["savedSources"] });
    },
  });

  const handleSearch = () => {
    setSearchQuery(inputQuery);
  };

  const handleSave = (source: SourceDTO) => {
    addItem(source); // Save to Zustand store
    // Optionally, save to backend if there was a persistent backend for saved items
    // saveToBackendMutation.mutate(source);
  };

  const searchResults = data?.results || [];

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex w-full items-center space-x-2 my-8">
        <Input
          type="text"
          placeholder="Search for a language or framework (e.g., 'java', 'react')"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button onClick={handleSearch} disabled={!inputQuery.trim()}>Search</Button>
      </div>

      <Separator className="my-6" />

      {isLoading && searchQuery && <div className="text-center py-8">Searching for "{searchQuery}"...</div>}

      {isError && searchQuery && (
        <div className="text-center py-8 text-red-500">Error: {error?.message || "Failed to fetch results."}</div>
      )}

      {!isLoading && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">No authoritative sources found for "{searchQuery}".</div>
      )}

      <div className="space-y-4">
        {searchResults.map((source) => (
          <ResultCard
            key={source.url}
            source={source}
            onSave={handleSave}
            isSaved={isSourceSaved(source.url)}
          />
        ))}
      </div>
    </div>
  );
}
