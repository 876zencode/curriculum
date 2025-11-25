import { CurriculumDTO, LearningLevelDTO, TopicDTO, LearningResourceDTO } from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription import
import { ExternalLink, Book, Video, FileText, Github, Globe } from "lucide-react"; // Added new icons

// Helper function to get icon based on resource type
const getIconForResourceType = (type: string) => {
  switch (type.toLowerCase()) {
    case "documentation":
    case "article":
    case "tutorial": // Added tutorial
      return <FileText className="h-4 w-4 mr-2" />;
    case "video":
      return <Video className="h-4 w-4 mr-2" />;
    case "github":
      return <Github className="h-4 w-4 mr-2" />;
    case "book":
      return <Book className="h-4 w-4 mr-2" />;
    default:
      return <Globe className="h-4 w-4 mr-2" />;
  }
};

// Helper function to get color class based on resource type
const getResourceTypeColorClass = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return "bg-green-500 text-white";
    case "article":
    case "documentation":
    case "tutorial":
      return "bg-blue-500 text-white";
    case "github":
      return "bg-purple-500 text-white";
    case "book":
      return "bg-yellow-500 text-black"; // Text might need to be black for yellow bg
    default:
      return "bg-gray-500 text-white";
  }
};

// Helper function to render learning resources
const renderLearningResources = (resources: LearningResourceDTO[]) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
    {resources.map((resource, index) => (
      <Card key={index}>
        <CardHeader>
          <CardTitle className="text-md">{resource.title}</CardTitle>
          <CardDescription className="flex items-center text-sm">
            <span className={`px-2 py-0.5 rounded-full ${getResourceTypeColorClass(resource.type)} mr-2`}>
              {resource.type}
            </span>
            | Authority: {(resource.authority_score * 100).toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">{resource.short_summary}</p>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full">
              {getIconForResourceType(resource.type)} View Resource <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </a>
        </CardContent>
      </Card>
    ))}
  </div>
);

export function CurriculumBreakdown({ curriculum }: { curriculum: CurriculumDTO }) {
  const renderTopics = (topics: TopicDTO[], curriculumData: CurriculumDTO, level: number = 0) => { // Added curriculumData param
    return topics.map((topic) => (
      <AccordionItem value={topic.id} key={topic.id}>
        <AccordionTrigger className={`text-left ${level === 0 ? 'font-semibold text-base' : 'text-sm'}`}>
          <div className="flex justify-between items-center w-full pr-4">
            <span>{topic.order}. {topic.title}</span>
            {topic.estimated_hours > 0 && (
              <Badge variant="outline" className="ml-2 whitespace-nowrap">{topic.estimated_hours} hrs</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pl-4">
          <p className="text-sm text-muted-foreground mb-2">{topic.description}</p>
          {topic.outcomes && topic.outcomes.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-xs text-muted-foreground">Outcomes: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.outcomes.map((outcome, idx) => <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-xs">{outcome}</Badge>)}
              </div>
            </div>
          )}
           {topic.example_exercises && topic.example_exercises.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-xs text-muted-foreground">Exercises: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.example_exercises.map((exercise, idx) => <Badge key={idx} variant="outline" className="px-2 py-0.5 text-xs">{exercise}</Badge>)}
              </div>
            </div>
          )}
          {topic.helpful_references && topic.helpful_references.length > 0 && (
            <div className="mb-2">
              <span className="font-medium text-xs text-muted-foreground">References: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.helpful_references.map((ref, idx) => {
                  const canonicalSource = curriculumData.canonical_sources?.find(cs => cs.id === ref.sourceId);
                  if (!canonicalSource) return null; // Or render a fallback

                  return (
                    <a href={canonicalSource.url} target="_blank" rel="noopener noreferrer" key={idx} 
                       className="flex items-center text-blue-500 hover:underline text-xs"
                       title={`${canonicalSource.title} (${canonicalSource.steward}): ${canonicalSource.short_summary}`}> {/* Tooltip */}
                        {canonicalSource.title} <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* New section for Curated Learning Materials */}
          {topic.learning_resources && topic.learning_resources.length > 0 && (
            <div className="mt-4">
              <span className="font-medium text-sm">Curated Learning Materials:</span>
              {renderLearningResources(topic.learning_resources)}
            </div>
          )}

          {topic.subtopics && topic.subtopics.length > 0 && (
            <div className="pl-4 border-l ml-2 mt-2">
              <Accordion type="multiple" className="w-full">
                {renderTopics(topic.subtopics, curriculumData, level + 1)} {/* Pass curriculumData here */}
              </Accordion>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    ));
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Curriculum Breakdown</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Structured path from Beginner to Expert, with estimated hours per level and key topics.
        (Generated by {curriculum.model_version} at {new Date(curriculum.generated_at).toLocaleString()})
      </p>

      <div className="space-y-6">
        {curriculum.overall_learning_path.map((levelData: LearningLevelDTO) => (
          <Card key={levelData.level}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{levelData.level}</span>
                <Badge className="bg-blue-500 text-white">{levelData.estimated_hours} hrs est.</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {renderTopics(levelData.topics, curriculum)} {/* Pass curriculum here */}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
