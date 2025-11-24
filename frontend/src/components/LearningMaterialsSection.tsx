import React from "react";
import { Link } from "react-router-dom";
import { CurriculumDTO, TopicDTO, LearningResourceDTO } from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Book, Video, FileText, Github, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LearningMaterialsSectionProps {
  curriculum: CurriculumDTO;
}

const getIconForResourceType = (type: string) => {
  switch (type.toLowerCase()) {
    case "documentation":
    case "article":
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

const renderLearningResources = (resources: LearningResourceDTO[]) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
    {resources.map((resource, index) => (
      <Card key={index}>
        <CardHeader>
          <CardTitle className="text-md">{resource.title}</CardTitle>
          <CardDescription className="text-sm">Type: {resource.type} | Authority: {(resource.authority_score * 100).toFixed(0)}%</CardDescription>
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

const renderTopicWithResources = (topic: TopicDTO) => (
  <div key={topic.id} className="mb-4">
    <h4 className="text-lg font-semibold mb-2">{topic.title}</h4>
    {topic.learning_resources && topic.learning_resources.length > 0 && (
      <>
        <h5 className="text-md font-medium mb-2">Curated Materials:</h5>
        {renderLearningResources(topic.learning_resources)}
      </>
    )}
    {topic.subtopics && topic.subtopics.length > 0 && (
      <div className="ml-4 mt-4">
        {topic.subtopics.map(subtopic => (
          <div key={subtopic.id} className="mb-4">
            <h5 className="text-md font-semibold mb-2">{subtopic.title}</h5>
            {subtopic.learning_resources && subtopic.learning_resources.length > 0 && (
              <>
                <h6 className="text-sm font-medium mb-2">Curated Materials:</h6>
                {renderLearningResources(subtopic.learning_resources)}
              </>
            )}
            {/* Further nested subtopics are not explicitly handled here for brevity, adjust as needed */}
          </div>
        ))}
      </div>
    )}
  </div>
);


export function LearningMaterialsSection({ curriculum }: LearningMaterialsSectionProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Curated Learning Materials</h2>
      {curriculum.overall_learning_path && curriculum.overall_learning_path.length > 0 ? (
        <Accordion type="multiple" className="w-full">
          {curriculum.overall_learning_path.map((level) => (
            <AccordionItem key={level.level} value={level.level}>
              <AccordionTrigger className="text-xl font-semibold">{level.level} Level</AccordionTrigger>
              <AccordionContent>
                {level.topics && level.topics.length > 0 ? (
                  level.topics.map((topic) => (
                    <Accordion key={topic.id} type="multiple" className="w-full pl-4">
                      <AccordionItem value={topic.id}>
                        <AccordionTrigger className="text-lg font-medium">{topic.title}</AccordionTrigger>
                        <AccordionContent className="pl-4">
                          {renderTopicWithResources(topic)}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))
                ) : (
                  <p>No topics found for this level.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p>No learning materials available for this curriculum.</p>
      )}
    </div>
  );
}
