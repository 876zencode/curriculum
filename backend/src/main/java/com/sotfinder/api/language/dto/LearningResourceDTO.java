package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LearningResourceDTO(
    String title,
    String url,
    String type, // e.g., "Documentation", "Video", "Article", "GitHub", "Book"
    @JsonProperty("authority_score") double authorityScore, // A score from 0-1 based on trust profile
    @JsonProperty("short_summary") String shortSummary // AI-generated brief description of the resource
) {}