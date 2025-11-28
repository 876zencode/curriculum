import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLanguages } from "@/lib/api";

export function HomePage() {
  const {
    data: languages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
    staleTime: Infinity, // avoid refetching when navigating back
    refetchOnWindowFocus: false,
  });

  const capitalizeFirst = (value: string | undefined) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const languageDescriptions: { [key: string]: string } = {
    java: "The leading language for enterprise software, Android development, and large-scale systems.",
    react: "A JavaScript library for building user interfaces, maintained by Meta and a community of individual developers and companies.",
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Choose a Language to Learn</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
        Select a programming language or framework to explore its canonical learning path and curated curriculum.
      </p>

      {error && (
        <div className="text-red-500 text-center mb-4 text-sm">
          {error.message ?? "Unable to load languages"}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground mb-4">Loading languages...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((lang) => (
          <Card key={lang.slug}>
            <CardHeader>
              <CardTitle>{capitalizeFirst(lang.label) || capitalizeFirst(lang.slug)}</CardTitle>
              <CardDescription>{languageDescriptions[lang.slug.toLowerCase()] || "A popular programming language."}</CardDescription>
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
        More topics coming soon!
      </div>
    </div>
  );
}
