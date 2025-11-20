import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function HomePage() {
  const languages = [
    { slug: "java", name: "Java", description: "The leading language for enterprise software, Android development, and large-scale systems." },
    { slug: "react", name: "React", description: "A JavaScript library for building user interfaces, maintained by Meta and a community of individual developers and companies." },
    // Add more languages as needed
  ];

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Choose a Language to Learn</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        Select a programming language or framework to explore its canonical learning path and curated curriculum.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((lang) => (
          <Card key={lang.slug}>
            <CardHeader>
              <CardTitle>{lang.name}</CardTitle>
              <CardDescription>{lang.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={`/language/${lang.slug}`}>
                <Button className="w-full">View Curriculum</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      <div className="text-center text-sm text-gray-500">
        More languages coming soon!
      </div>
    </div>
  );
}
