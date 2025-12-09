import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguages } from "@/lib/api";
import { Sparkles, ArrowRight, BookOpen, Layers, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-10 space-y-12">
        <header className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Canonical learning hubs
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Your best path from fundamentals to mastery
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Dive into curated, canonical curriculums with AI summaries and practice-ready resources. Pick a track and
              start learning without the noise.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Quality-checked sources
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Beginner to expert levels
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Summaries and takeaways
            </div>
          </div>
        </header>

        {error && (
          <div className="text-red-500 text-center text-sm">
            {error.message ?? "Unable to load languages"}
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground">Loading languages...</div>
        )}

        <section className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracks</p>
              <h2 className="text-2xl font-bold">Choose your next stack</h2>
            </div>
            <p className="text-sm text-muted-foreground">Pick a language or framework to see its journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <Card key={lang.slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{capitalizeFirst(lang.label) || capitalizeFirst(lang.slug)}</span>
                    <Badge variant="secondary" className="text-[11px]">
                      Guided
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {languageDescriptions[lang.slug.toLowerCase()] || "A popular programming language."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <Link to={`/language/${lang.slug}`}>
                    <Button className="w-full group">
                      Start track
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto text-center space-y-3 border rounded-lg p-6 bg-card">
          <p className="text-sm font-semibold">More tracks coming soon</p>
          <p className="text-sm text-muted-foreground">
            We’re adding more stacks. Tell us what you want next and we’ll prioritize it.
          </p>
          <Button variant="outline" disabled>
            Request a track
          </Button>
        </section>
      </div>
    </div>
  );
}
