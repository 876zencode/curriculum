import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSavedSourcesStore } from "@/store/savedSourcesStore";
import { RankedResourceDTO, CurriculumTopicDTO, LearningLevelTagDTO } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CurriculumBreakdownPage() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const decodedSourceId = sourceId ? decodeURIComponent(sourceId) : '';
  const { savedSources } = useSavedSourcesStore();
  const [resource, setResource] = useState<RankedResourceDTO | null>(null);

  useEffect(() => {
    if (decodedSourceId && savedSources[decodedSourceId]) {
      setResource(savedSources[decodedSourceId]);
    } else {
      // Handle case where resource is not found (e.g., redirect or show error)
      // For now, we'll just set it to null and show a message
      setResource(null);
    }
  }, [decodedSourceId, savedSources]);

  if (!resource) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
        <p className="text-gray-600">The curriculum breakdown for this resource could not be found.</p>
        <Link to="/">
          <Button variant="link" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Search</Button>
        </Link>
      </div>
    );
  }

  // Helper to render topics recursively
  const renderTopics = (topics: CurriculumTopicDTO[], level: number = 0) => {
    return topics.map((topic, index) => (
      <AccordionItem value={`${topic.name}-${index}-${level}`} key={`${topic.name}-${index}-${level}`}>
        <AccordionTrigger className={`text-left ${level === 0 ? 'font-semibold' : ''}`}>
          {`${topic.order}. ${topic.name}`}
          <Badge variant="secondary" className="ml-2">{topic.category}</Badge>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{topic.summary}</p>
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div className={`ml-4 ${level < 2 ? 'border-l pl-4' : ''}`}>
              {renderTopics(topic.subtopics, level + 1)}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    ));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link to="/">
        <Button variant="link" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Search</Button>
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {resource.title}
            </a>
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {resource.resource_type} - {resource.url}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-md mb-4">{resource.short_description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default">Confidence: {(resource.confidence * 100).toFixed(0)}%</Badge>
            {resource.pedagogical_quality_score !== undefined && (
              <Badge variant="secondary">Pedagogy: {(resource.pedagogical_quality_score * 100).toFixed(0)}%</Badge>
            )}
            {resource.estimated_difficulty && (
              <Badge variant="outline">Difficulty: {resource.estimated_difficulty}</Badge>
            )}
            {resource.learning_level_tags.map((tag: LearningLevelTagDTO) => (
              <Badge key={tag.level} variant="secondary">{tag.level}</Badge>
            ))}
          </div>

          {resource.skill_outcomes && resource.skill_outcomes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Skill Outcomes:</h3>
              <div className="flex flex-wrap gap-2">
                {resource.skill_outcomes.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {resource.curriculum_extract && resource.curriculum_extract.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Topics Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {renderTopics(resource.curriculum_extract)}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Simplified Learning Path (Timeline) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Learning Path Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-300 dark:bg-gray-700"></div> {/* Timeline line */}

            {/* Beginner */}
            <div className="mb-6 relative">
              <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-500 dark:bg-blue-600 block"></span>
              <h3 className="font-semibold text-lg ml-4">Beginner Core Topics</h3>
              <p className="text-gray-600 dark:text-gray-400 ml-4">
                Introduction to concepts, basic syntax, and fundamental building blocks.
              </p>
              {resource.estimated_difficulty === "Beginner" && (
                  <Badge variant="outline" className="ml-4 mt-1">Recommended for this resource</Badge>
              )}
            </div>

            {/* Intermediate */}
            <div className="mb-6 relative">
              <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-green-500 dark:bg-green-600 block"></span>
              <h3 className="font-semibold text-lg ml-4">Intermediate Topics</h3>
              <p className="text-gray-600 dark:text-gray-400 ml-4">
                Deeper dive into language features, common libraries, and architectural patterns.
              </p>
              {resource.estimated_difficulty === "Intermediate" && (
                  <Badge variant="outline" className="ml-4 mt-1">Recommended for this resource</Badge>
              )}
            </div>

            {/* Advanced */}
            <div className="relative">
              <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-purple-500 dark:bg-purple-600 block"></span>
              <h3 className="font-semibold text-lg ml-4">Advanced Skills</h3>
              <p className="text-gray-600 dark:text-gray-400 ml-4">
                Performance optimization, complex problem-solving, and ecosystem mastery.
              </p>
              {resource.estimated_difficulty === "Advanced" && (
                  <Badge variant="outline" className="ml-4 mt-1">Recommended for this resource</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {resource.reasoning && (
        <Card>
          <CardHeader>
            <CardTitle>Why this source is recommended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{resource.reasoning}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
