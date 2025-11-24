
import { Link } from "react-router-dom"; // Import Link
import { RankedResourceDTO, LearningLevelDTO } from "@/lib/api"; // Corrected DTO import
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge"; // For new badges
import { AuthorityBadge } from "./AuthorityBadge";
import { ConfidenceBar } from "./ConfidenceBar";
// import { MetadataTags } from "./MetadataTags"; // MetadataTags might be less relevant with resource_type and new badges

interface ResultCardProps {
  resource: RankedResourceDTO; // Changed prop name and type
  onSave: (resource: RankedResourceDTO) => void; // Changed type
  isSaved: boolean;
}

export function ResultCard({ resource, onSave, isSaved }: ResultCardProps) {

  const handleViewCurriculum = () => {
    onSave(resource); // Ensure the resource is saved before navigating
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {resource.title}
          </a>
        </CardTitle>
        <CardDescription>
          <span className="font-semibold">{resource.resource_type}</span> - {resource.url}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{resource.short_description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <AuthorityBadge confidence={resource.confidence} />
          {resource.pedagogical_quality_score !== undefined && (
            <Badge variant="secondary">Pedagogy: {(resource.pedagogical_quality_score * 100).toFixed(0)}%</Badge>
          )}
          {resource.estimated_difficulty && (
            <Badge variant="outline">{resource.estimated_difficulty}</Badge>
          )}
          {resource.learning_level_tags.map((tag: LearningLevelTag) => (
            <Badge key={tag.level} variant="secondary">{tag.level}</Badge>
          ))}
        </div>
        <ConfidenceBar confidence={resource.confidence} />
        {/* MetadataTags might be removed or adapted if 'metadata' field is still used for other purposes */}
        {/* {resource.metadata && <MetadataTags metadata={resource.metadata} />} */}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-2">
            {/* Modified Link to call onSave before navigation */}
            <Link to={`/learn/${encodeURIComponent(resource.url)}`} onClick={handleViewCurriculum}>
                <Button variant="outline" size="sm">View Curriculum</Button>
            </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Why ranked?</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reasoning for Ranking</DialogTitle>
                  <DialogDescription>
                    {resource.reasoning}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
        </div>
        <Button onClick={() => onSave(resource)} disabled={isSaved} size="sm">
          {isSaved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
