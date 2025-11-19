import { Separator } from "@/components/ui/separator";
import { ResultCard } from "@/components/ResultCard"; // Reusing the ResultCard component
import { useSavedSourcesStore } from "@/store/savedSourcesStore";
import { SourceDTO } from "@/lib/api"; // Import SourceDTO

export function SavedSourcesPage() {
  const { savedSources, removeItem, isSourceSaved } = useSavedSourcesStore();
  const savedSourcesList = Object.values(savedSources); // Convert map to array

  // Function to handle removal of a saved source
  const handleRemove = (source: SourceDTO) => {
    removeItem(source.url);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Saved Sources</h1>
      <Separator className="my-6" />

      {savedSourcesList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No sources saved yet.</div>
      ) : (
        <div className="space-y-4">
          {savedSourcesList.map((source) => (
            <ResultCard
              key={source.url}
              source={source}
              onSave={handleRemove} // Use handleRemove here
              isSaved={isSourceSaved(source.url)} // Will always be true here
            />
          ))}
        </div>
      )}
    </div>
  );
}
