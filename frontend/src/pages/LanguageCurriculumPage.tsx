import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurriculum } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { CurriculumBreakdown } from "@/components/CurriculumBreakdown";
import { Skeleton } from "@/components/ui/skeleton";
import type { CurriculumDTO } from "@/lib/types";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export function LanguageCurriculumPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navState = (location.state as { returnOpenTopics?: string[]; returnFocusedTopicId?: string | null } | null) || null;

  const { data: curriculum, isLoading: curriculumLoading, isError: curriculumError, error: curriculumErrorMsg } = useQuery<CurriculumDTO, Error>({
    queryKey: ["curriculum", slug],
    queryFn: () => getCurriculum(slug!),
    enabled: !!slug,
  });

  if (curriculumError) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load curriculum: {curriculumErrorMsg?.message}</p>
        <Link to="/">
          <Button variant="link" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Languages</Button>
        </Link>
      </div>
    );
  }

  const isLoading = curriculumLoading;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Link to="/">
        <Button variant="link" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Languages</Button>
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-extrabold mb-2">{slug?.toUpperCase()} - Canonical Learning Hub</h1>
          <p className="text-md text-muted-foreground mb-6">
            {curriculum?.explanation || "AI-generated curriculum for " + slug}
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <FeedbackWidget
              context={`Curriculum overview for ${slug}`}
              triggerLabel="Feedback on this path"
              size="sm"
              metadata={{ language: slug, curriculumId: curriculum?.language }}
              ctaHint="Drop quick feedback on the sequencing, sources, or summaries."
            />
          </div>

          {/* Removed dedicated Canonical Sources section */}
          <Separator className="my-6" />

          {curriculum && slug && (
            <CurriculumBreakdown
              curriculum={curriculum}
              languageSlug={slug}
              initialOpenTopics={navState?.returnOpenTopics ?? []}
              initialFocusedTopicId={navState?.returnFocusedTopicId ?? null}
            />
          )}
        </>
      )}
    </div>
  );
}
