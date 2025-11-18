import { SavedList } from "@/components/SavedList";
import { Separator } from "@/components/ui/separator";

export function SavedSourcesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Saved Sources</h1>
      <Separator className="my-6" />
      <SavedList />
    </div>
  );
}
