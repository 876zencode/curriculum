import { Link } from "react-router-dom";
import { CanonicalSourceDTO } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface CanonicalSourcesGroupProps {
  sources: CanonicalSourceDTO[];
  languageSlug: string; // Needed for linking to source breakdown page
}

export function CanonicalSourcesGroup({ sources, languageSlug }: CanonicalSourcesGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map((source) => (
        <Card key={source.id} className="flex flex-col">
          <CardHeader className="flex-grow">
            <CardTitle className="text-lg">
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {source.title}
              </a>
            </CardTitle>
            <CardDescription className="text-sm">
              <div className="flex flex-wrap items-center gap-1 mb-1">
                <Badge variant="secondary">{source.type}</Badge>
                <Badge variant="outline">{source.steward}</Badge>
                {source.confidence >= 0.90 && <Badge className="bg-yellow-500 text-white">High Authority</Badge>}
                {source.confidence >= 0.75 && source.confidence < 0.90 && <Badge className="bg-gray-400 text-black">Medium Authority</Badge>}
                {source.confidence < 0.75 && <Badge variant="destructive">Low Authority</Badge>}
              </div>
              <p className="mt-2">{source.short_summary}</p>
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-4 flex justify-between items-center">
            <Link to={`/language/${languageSlug}/sources/${source.id}`}>
              <Button variant="outline" size="sm">View Breakdown</Button>
            </Link>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="flex items-center">
                Visit Site <ExternalLink className="ml-1 h-4 w-4" />
              </Button>
            </a>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
