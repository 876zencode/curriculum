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

export type FeedbackRecord = {
  id: string | number;
  message: string;
  category: FeedbackCategory;
  context: string;
  metadata: Record<string, any>;
  userId: string | null;
  userEmail: string | null;
  createdAt: string;
};

export type FeedbackListParams = {
  category?: FeedbackCategory;
  limit?: number;
};

export async function listFeedback(params: FeedbackListParams = {}): Promise<FeedbackRecord[]> {
  if (!supabaseClient || !isSupabaseConfigured) {
    throw new Error("Supabase is not configured for feedback storage.");
  }

  let query = supabaseClient
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id ?? row.created_at ?? `fb-${Math.random().toString(36).slice(2)}`,
    message: row.message ?? "",
    category: row.category as FeedbackCategory,
    context: row.context ?? "",
    metadata: row.metadata ?? {},
    userId: row.user_id ?? null,
    userEmail: row.user_email ?? null,
    createdAt: row.created_at ?? "",
  }));
}
