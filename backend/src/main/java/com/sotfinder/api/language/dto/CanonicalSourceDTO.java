package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CanonicalSourceDTO(
    String id, // Unique identifier for the source, e.g., a slug derived from the URL or a UUID
    String title,
    String url,
    String steward, // e.g., "Oracle", "MDN", "Spring"
    String type, // e.g., "Official Docs", "Tutorial", "API Reference"
    double confidence, // LLM's confidence in this source's authority
    @JsonProperty("short_summary") String shortSummary // AI-generated brief description
) {}