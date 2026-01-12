import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguages } from "@/lib/api";
import { Sparkles, ArrowRight, BookOpen, Layers, Shield } from "lucide-react";
import { FeedbackWidget } from "@/components/FeedbackWidget";

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
    java: "A versatile, high-performance language used broadly for enterprise systems, large-scale backend services, Android applications, and robust platform-independent software across industries.",
    javascript: "The ubiquitous language of the web and modern applications — powering interactive web interfaces, scalable backend services, cross-platform apps, and full-stack systems across browsers, servers, and cloud environments.",
  };

  const getBadgeForSlug = (slug: string) => {
    const normalized = slug.toLowerCase();
    if (normalized === "java") {
      return {
        label: "Expert reviewed",
        className: "bg-emerald-100 text-emerald-900 border-emerald-200",
      };
    }
    if (normalized === "javascript") {
      return {
        label: "In development",
        className: "bg-amber-100 text-amber-900 border-amber-200",
      };
    }
    return null;
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
            {languages.map((lang) => {
              const badge = getBadgeForSlug(lang.slug);
              return (
                <Card key={lang.slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{capitalizeFirst(lang.label) || capitalizeFirst(lang.slug)}</span>
                    {badge && (
                      <Badge variant="secondary" className={`text-[11px] ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    )}
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
              );
            })}
          </div>
        </section>

        <section className="max-w-5xl mx-auto text-center space-y-3 border rounded-lg p-6 bg-card">
          <p className="text-sm font-semibold">More tracks coming soon</p>
          <p className="text-sm text-muted-foreground">
            We’re adding more stacks. Tell us what you want next and we’ll prioritize it.
          </p>
          <div className="flex justify-center">
            <FeedbackWidget
              context="Home track requests"
              triggerLabel="Request or upvote a track"
              size="sm"
              metadata={{ knownLanguages: languages.map((l) => l.slug) }}
              ctaHint="Sign in with Google and drop the stacks or frameworks you want us to add."
            />
          </div>
        </section>
      </div>
    </div>
  );
}
