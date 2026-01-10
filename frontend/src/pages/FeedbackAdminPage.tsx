import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Bug,
  Clock4,
  Copy,
  Database,
  Filter,
  Inbox,
  Info,
  Lightbulb,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { listFeedback, type FeedbackCategory, type FeedbackRecord } from "@/lib/feedback";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

type CategoryFilter = FeedbackCategory | "all";

const categoryMeta: Record<FeedbackCategory, { label: string; icon: JSX.Element; className: string }> = {
  experience: {
    label: "Experience",
    icon: <Sparkles className="h-4 w-4 text-purple-600" />,
    className: "bg-purple-50 text-purple-800 border-purple-100",
  },
  content: {
    label: "Content quality",
    icon: <BookOpen className="h-4 w-4 text-blue-600" />,
    className: "bg-blue-50 text-blue-800 border-blue-100",
  },
  bug: {
    label: "Bug",
    icon: <Bug className="h-4 w-4 text-rose-600" />,
    className: "bg-rose-50 text-rose-800 border-rose-100",
  },
  idea: {
    label: "Idea",
    icon: <Lightbulb className="h-4 w-4 text-amber-600" />,
    className: "bg-amber-50 text-amber-800 border-amber-100",
  },
};

export function FeedbackAdminPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [contextFilter, setContextFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const { user, status, signInWithGoogle, isConfigured: isAuthConfigured } = useAuth();

  const authReady = isSupabaseConfigured && isAuthConfigured;

  const {
    data: feedback = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<FeedbackRecord[], Error>({
    queryKey: ["feedback", categoryFilter],
    queryFn: () =>
      listFeedback({
        category: categoryFilter === "all" ? undefined : categoryFilter,
        limit: 250,
      }),
    enabled: authReady && Boolean(user),
    staleTime: 1000 * 60 * 5,
  });

  const contextCounts = useMemo(() => {
    const counts = new Map<string, number>();
    feedback.forEach((item) => {
      const key = extractContext(item.context);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [feedback]);

  const stats = useMemo(
    () => ({
      total: feedback.length,
      experience: feedback.filter((f) => f.category === "experience").length,
      content: feedback.filter((f) => f.category === "content").length,
      bug: feedback.filter((f) => f.category === "bug").length,
      idea: feedback.filter((f) => f.category === "idea").length,
    }),
    [feedback],
  );

  const visibleFeedback = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return feedback.filter((item) => {
      const matchesContext = contextFilter === "all" || extractContext(item.context) === contextFilter;
      if (!matchesContext) return false;
      if (!normalizedSearch) return true;
      const haystack = `${item.message} ${item.context} ${item.userEmail ?? ""} ${JSON.stringify(item.metadata ?? {})}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [contextFilter, feedback, search]);

  const handleCopy = (id: string | number, text: string) => {
    if (!text || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1500);
      })
      .catch(() => {
        setCopiedId(null);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-bold">Feedback inbox</h1>
          <p className="text-sm text-muted-foreground">
            Review user signals across the app, filter by context, and reach back out quickly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching || isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Badge variant={isSupabaseConfigured ? "default" : "outline"} className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5" />
            {isSupabaseConfigured ? "Supabase connected" : "Supabase missing"}
          </Badge>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">Supabase is not configured</CardTitle>
            <CardDescription className="text-amber-800">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment to load feedback submissions.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {authReady && !user && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle>Sign in to view feedback</CardTitle>
            <CardDescription>Authenticate with Google to read user submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signInWithGoogle()} disabled={status === "loading"}>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total notes" value={stats.total} icon={<Inbox className="h-4 w-4 text-primary" />} />
        <StatCard title="Experience" value={stats.experience} icon={<Sparkles className="h-4 w-4 text-purple-600" />} />
        <StatCard title="Content" value={stats.content} icon={<BookOpen className="h-4 w-4 text-blue-600" />} />
        <StatCard title="Bugs / Ideas" value={`${stats.bug} bugs · ${stats.idea} ideas`} icon={<Lightbulb className="h-4 w-4 text-amber-600" />} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filters
          </CardTitle>
          <CardDescription>Focus the inbox by type, context, or keyword.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "experience", "content", "bug", "idea"] as CategoryFilter[]).map((category) => {
                const meta = category === "all" ? null : categoryMeta[category];
                return (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                    className="flex items-center gap-1"
                  >
                    {meta?.icon ?? <MessageSquare className="h-4 w-4" />}
                    {category === "all" ? "All" : meta?.label}
                  </Button>
                );
              })}
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search message, email, or context"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Contexts</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={contextFilter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setContextFilter("all")}
              >
                All contexts
              </Badge>
              {contextCounts.slice(0, 8).map(([context, count]) => (
                <Badge
                  key={context}
                  variant={contextFilter === context ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setContextFilter(context)}
                >
                  {context || "General"} · {count}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle className="text-rose-900">Unable to load feedback</CardTitle>
            <CardDescription className="text-rose-800">{error.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Separator />

      <div className="space-y-3">
        {(isLoading || isFetching) && (
          <p className="text-sm text-muted-foreground">Loading feedback...</p>
        )}
        {!isLoading && visibleFeedback.length === 0 && (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex justify-center gap-2 text-base">
                <Inbox className="h-4 w-4 text-muted-foreground" />
                Nothing here yet
              </CardTitle>
              <CardDescription>New submissions will show up as soon as they are recorded.</CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-3">
          {visibleFeedback.map((item) => (
            <FeedbackCard
              key={item.id}
              feedback={item}
              copied={copiedId === item.id}
              onCopy={(text) => handleCopy(item.id, text)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedbackCard({
  feedback,
  copied,
  onCopy,
}: {
  feedback: FeedbackRecord;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  const meta = categoryMeta[feedback.category];
  const metadataEntries = Object.entries(feedback.metadata ?? {}).filter(([, value]) => value !== undefined && value !== null);

  return (
    <Card className="shadow-sm border-primary/10 hover:border-primary/40 transition">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`flex items-center gap-1 ${meta.className}`}>
              {meta.icon}
              {meta.label}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock4 className="h-3.5 w-3.5" />
              {formatRelativeTime(feedback.createdAt)}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {extractContext(feedback.context) || "General"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            {feedback.userEmail || "Anonymous"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{feedback.message}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Full context: {feedback.context}
          </Badge>
          {feedback.userEmail && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {feedback.userEmail}
            </Badge>
          )}
        </div>
        {metadataEntries.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {metadataEntries.map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-[11px]">
                {key}: {String(value)}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          {feedback.userEmail && (
            <Button variant="secondary" size="sm" asChild>
              <a href={`mailto:${feedback.userEmail}?subject=Thanks for your feedback&body=${encodeURIComponent(feedback.message)}`}>
                Reply via email
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onCopy(feedback.message)} className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy text"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element }) {
  return (
    <Card className="border border-muted bg-gradient-to-br from-muted/60 to-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        {icon}
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = dateString ? new Date(dateString) : null;
  if (!date || isNaN(date.getTime())) return "Unknown time";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function extractContext(rawContext: string): string {
  if (!rawContext) return "General";
  const [first] = rawContext.split("|");
  return first.trim();
}
