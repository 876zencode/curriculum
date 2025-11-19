import { useState, useEffect } from "react"; // Added useEffect
import { useQuery } from "@tanstack/react-query";
import { searchSources, saveSource, RankedResourceDTO, SearchResponseDTO } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResultCard } from "@/components/ResultCard";
import { useSavedSourcesStore } from "@/store/savedSourcesStore";
import { useSearchStore } from "@/store/searchStore"; // Import the new search store
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function HomePage() {
  const { lastSearchQuery, lastSearchResults, setSearchState } = useSearchStore(); // Use the search store

  const [inputQuery, setInputQuery] = useState(lastSearchQuery);
  const [searchQuery, setSearchQuery] = useState(lastSearchQuery);
  const queryClient = useQueryClient();

  // Use the stored search results directly if available, otherwise fetch
  const { data, isLoading, isError, error, refetch } = useQuery<SearchResponseDTO, Error>({
    queryKey: ["search", searchQuery],
    queryFn: () => searchSources(searchQuery),
    enabled: !!searchQuery && searchQuery !== lastSearchQuery, // Only fetch if query changed or not initially loaded
    initialData: searchQuery === lastSearchQuery ? lastSearchResults : undefined, // Use initialData for state restoration
    onSuccess: (newData) => {
      // Only update store if new data is different from existing store data
      if (JSON.stringify(newData) !== JSON.stringify(lastSearchResults)) {
        setSearchState(searchQuery, newData);
      }
    }
  });

  // Effect to refetch if search query is enabled and no initial data
  useEffect(() => {
    if (!!searchQuery && !lastSearchResults) {
      refetch();
    }
  }, [searchQuery, lastSearchResults, refetch]);


  const { savedSources, addItem, removeItem, isSourceSaved } = useSavedSourcesStore();

  const saveToBackendMutation = useMutation({
    mutationFn: saveSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSources"] });
    },
  });

  const handleSearch = () => {
    // Only perform search if query is not empty and different from current searchQuery
    if (inputQuery.trim() !== "" && inputQuery.trim() !== searchQuery) {
      setSearchQuery(inputQuery);
      // Clear previous results in store to indicate a new search is happening
      setSearchState(inputQuery, null);
    } else if (inputQuery.trim() === searchQuery && lastSearchResults) {
      // If query is the same and we have results, no need to refetch
      setSearchState(searchQuery, lastSearchResults);
    }
  };

  const handleSave = (resource: RankedResourceDTO) => {
    addItem(resource);
    // saveToBackendMutation.mutate(resource); // Keep optional backend save commented
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
        {searchResults.map((resource) => (
          <ResultCard
            key={resource.url}
            resource={resource}
            onSave={handleSave}
            isSaved={isSourceSaved(resource.url)}
          />
        ))}
      </div>
    </div>
  );
}
