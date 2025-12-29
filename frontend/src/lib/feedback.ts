import { isSupabaseConfigured, supabaseClient } from "./supabaseClient";

export type FeedbackCategory = "experience" | "content" | "bug" | "idea";

export type FeedbackPayload = {
  message: string;
  category: FeedbackCategory;
  context: string;
  metadata?: Record<string, any>;
  userId?: string | null;
  userEmail?: string | null;
};

export async function submitFeedback(payload: FeedbackPayload) {
  if (!supabaseClient || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured for feedback storage.");
  }

  const { data, error } = await supabaseClient
    .from("feedback")
    .insert({
      message: payload.message,
      category: payload.category,
      context: payload.context,
      metadata: payload.metadata ?? {},
      user_id: payload.userId ?? null,
      user_email: payload.userEmail ?? null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
