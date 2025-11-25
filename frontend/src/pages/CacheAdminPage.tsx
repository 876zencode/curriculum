import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLanguages, listCachedCurricula, refreshCurriculum } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import type { CachedCurriculumMetadata } from "@/lib/api";
import type { LanguageOption } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CacheAdminPage() {
  const queryClient = useQueryClient();

  const {
    data: languages = [],
    isLoading: languagesLoading,
    error: languagesError,
  } = useQuery<LanguageOption[], Error>({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const {
    data: cachedCurricula = [],
    isLoading: cacheLoading,
    error: cacheError,
    refetch: refetchCache,
  } = useQuery<CachedCurriculumMetadata[], Error>({
    queryKey: ["cachedCurricula"],
    queryFn: listCachedCurricula,
  });

  const refreshMutation = useMutation({
    mutationFn: (slug: string) => refreshCurriculum(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["curriculum", slug] });
      refetchCache();
    },
  });

  const cacheIndex = useMemo(() => {
    const index = new Map<string, { updated_at?: string | null; config_hash?: string | null }>();
    cachedCurricula.forEach((item) => {
      index.set(item.language_slug, {
        updated_at: item.updated_at,
        config_hash: item.config_hash,
      });
    });
    return index;
  }, [cachedCurricula]);

  const isBusyFor = (slug: string) => refreshMutation.isPending && refreshMutation.variables === slug;

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Cache</h1>
          <p className="text-sm text-muted-foreground">
            Supabase holds the latest generated curricula. Use this page to re-run the LLM and refresh cached rows.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetchCache()} disabled={cacheLoading}>
          Reload cache
        </Button>
      </div>

      {!isSupabaseConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Supabase is not configured</CardTitle>
            <CardDescription>
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment to enable caching.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {(languagesError || cacheError) && (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load data</CardTitle>
            <CardDescription>
              {languagesError?.message || cacheError?.message || "Unknown error loading cache state."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(languagesLoading || cacheLoading) && <div className="text-sm text-muted-foreground">Loading cache data...</div>}
        {!languagesLoading && languages.length === 0 && (
          <div className="text-sm text-muted-foreground">No languages available to refresh yet.</div>
        )}
        {languages.map((lang) => {
          const cached = cacheIndex.get(lang.slug);
          const updatedAt = cached?.updated_at ? new Date(cached.updated_at).toLocaleString() : "Never";
          return (
            <Card key={lang.slug} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{lang.label || lang.slug}</span>
                  <Badge variant={cached ? "default" : "secondary"}>{cached ? "Cached" : "Missing"}</Badge>
                </CardTitle>
                <CardDescription>{lang.slug}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">Last updated: {updatedAt}</p>
                {cached?.config_hash && (
                  <p className="text-xs text-muted-foreground break-all mt-2">
                    Config hash: {cached.config_hash.slice(0, 10)}…
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchCache()}
                  disabled={cacheLoading}
                >
                  Refresh status
                </Button>
                <Button
                  size="sm"
                  onClick={() => refreshMutation.mutate(lang.slug)}
                  disabled={!isSupabaseConfigured || isBusyFor(lang.slug)}
                >
                  {isBusyFor(lang.slug) ? "Refreshing…" : "Refresh cache via LLM"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
