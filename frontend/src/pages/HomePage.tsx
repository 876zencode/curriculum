import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchSources, saveSource, SourceDTO } from "@/lib/api";
import { SearchBar } from "@/components/SearchBar";
import { SourceResultCard } from "@/components/SourceResultCard";
import { Separator } from "@/components/ui/separator";

export function HomePage() {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchSources(query),
    enabled: !!query,
  });

  const saveMutation = useMutation({
    mutationFn: saveSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSources"] });
    },
  });

  const handleSave = (source: SourceDTO) => {
    saveMutation.mutate(source);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center">
        <SearchBar onSearch={setQuery} />
      </div>
      <Separator className="my-6" />
      {isLoading && <div>Loading...</div>}
      <div className="space-y-4">
        {searchResults?.map((source) => (
          <SourceResultCard key={source.url} source={source} onSave={handleSave} />
        ))}
      </div>
    </div>
  );
}
