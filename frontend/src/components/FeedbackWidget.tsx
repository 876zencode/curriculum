import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { submitFeedback, type FeedbackCategory } from "@/lib/feedback";

type FeedbackWidgetProps = {
  context: string;
  metadata?: Record<string, any>;
  triggerLabel?: string;
  size?: "sm" | "md";
  ctaHint?: string;
};

export function FeedbackWidget({
  context,
  metadata,
  triggerLabel = "Share feedback",
  size = "md",
  ctaHint,
}: FeedbackWidgetProps) {
  const location = useLocation();
  const { user, status, isConfigured, signInWithGoogle, signOut, firstName } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("experience");
  const [message, setMessage] = useState("");
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  const [showThanks, setShowThanks] = useState(false);

  const contextualMetadata = useMemo(
    () => ({
      path: location.pathname,
      ...metadata,
    }),
    [location.pathname, metadata],
  );

  const mutation = useMutation({
    mutationFn: () =>
      submitFeedback({
        message,
        category,
        context: `${context} | ${location.pathname}`,
        metadata: contextualMetadata,
        userId: user?.id,
        userEmail: user?.email,
      }),
    onSuccess: () => {
      setSubmissionNotice("Thanks for the signal—we'll review it soon.");
      setMessage("");
      setShowThanks(true);
      setTimeout(() => {
        setShowThanks(false);
        setOpen(false);
      }, 1400);
    },
    onError: (err: any) => {
      setSubmissionNotice(err?.message ?? "Unable to submit feedback right now.");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmissionNotice(null);
    if (!user) {
      setSubmissionNotice("Please sign in with Google to share feedback.");
      return;
    }
    if (!message.trim()) {
      setSubmissionNotice("Add a short note so we know what to improve.");
      return;
    }
    mutation.mutate();
  };

  const disabled = mutation.isPending || status === "loading";
  const showAuthPrompt = !user || !isConfigured;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size === "sm" ? "sm" : "default"} variant="outline" className="group">
          <MessageSquare className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl w-[92vw] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            In-app feedback
          </DialogTitle>
          <DialogDescription>
            Help us tune this experience. Feedback is linked to your Google account for follow-up.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs flex flex-wrap items-center gap-2 break-words">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide flex-shrink-0">
            Context
          </Badge>
          <span className="text-muted-foreground text-xs break-words flex-1 min-w-0">
            {context} — {location.pathname}
          </span>
        </div>

        {ctaHint && <p className="text-xs text-muted-foreground">{ctaHint}</p>}

        {!isConfigured && (
          <p className="text-sm text-red-500">
            Supabase is not configured, so feedback cannot be submitted right now.
          </p>
        )}
        {showThanks && (
          <div className="rounded-md border bg-emerald-50 text-emerald-700 px-3 py-2 text-sm shadow-sm animate-pulse">
            🎉 Thanks for the feedback! Keep it coming.
          </div>
        )}

        {showAuthPrompt ? (
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
              <span>Sign in with Google to attach your feedback to an account. This keeps the signal actionable.</span>
            </div>
            <Button
              disabled={!isConfigured || disabled}
              onClick={() => signInWithGoogle().catch((err) => setSubmissionNotice(err.message))}
            >
              Continue with Google
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  disabled={disabled}
                >
                  <option value="experience">Experience</option>
                  <option value="content">Content quality</option>
                  <option value="bug">Bug</option>
                  <option value="idea">Idea</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Signed in as</span>
                <Input value={firstName || (user?.user_metadata?.full_name as string) || (user?.email ?? "")} disabled readOnly />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Your feedback</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Tell us what works, what feels off, or what’s missing."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={disabled}
              />
            </label>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Google sign-in required</Badge>
                {user?.email && (
                  <span className="text-xs text-muted-foreground truncate">
                    {firstName || user.user_metadata?.full_name || user.email}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => signOut()}>
                  Sign out
                </Button>
                <Button type="submit" size="sm" disabled={disabled}>
                  {mutation.isPending ? "Sending..." : "Submit feedback"}
                </Button>
              </div>
            </div>

            {submissionNotice && (
              <p className={`text-xs ${mutation.isError ? "text-red-500" : "text-muted-foreground"}`}>
                {submissionNotice}
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
