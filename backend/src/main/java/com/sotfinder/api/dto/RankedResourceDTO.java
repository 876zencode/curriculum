package com.sotfinder.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record RankedResourceDTO(
    String title,
    String url,
    @JsonProperty("is_official") boolean isOfficial,
    double confidence,
    String reasoning, // Why this source is recommended
    MetadataDTO metadata, // Existing metadata, can be augmented or specific to type
    @JsonProperty("resource_type") String resourceType, // e.g., "Official Docs", "Tutorial"
    @JsonProperty("short_description") String shortDescription,
    @JsonProperty("learning_level_tags") List<LearningLevelTagDTO> learningLevelTags,
    @JsonProperty("skill_outcomes") List<String> skillOutcomes,
    @JsonProperty("estimated_difficulty") String estimatedDifficulty, // e.g., "Beginner", "Intermediate", "Advanced"
    @JsonProperty("pedagogical_quality_score") double pedagogicalQualityScore,
    @JsonProperty("curriculum_extract") List<CurriculumTopicDTO> curriculumExtract
) {}