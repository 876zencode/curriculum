package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map; // Map is no longer needed for recommendations, but keep for now if other recommendations exist

public record CurriculumDTO(
    String language,
    @JsonProperty("generated_at") LocalDateTime generatedAt,
    @JsonProperty("overall_learning_path") List<LearningLevelDTO> overallLearningPath,
    @JsonProperty("core_sources") List<String> coreSources, // New field for core sources
    @JsonProperty("supplemental_sources") List<String> supplementalSources, // New field for supplemental sources
    @JsonProperty("practice_projects") List<PracticeProjectDTO> practiceProjects, // New field for practice projects
    String explanation, // How the LLM consolidated sources and decided ordering
    @JsonProperty("model_version") String modelVersion // LLM model version used
) {}