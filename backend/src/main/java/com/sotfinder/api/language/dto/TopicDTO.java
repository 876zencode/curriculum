package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record TopicDTO(
    String id, // Unique identifier for the topic
    String title,
    String description,
    int order, // Recommended learning order within its level
    @JsonProperty("estimated_hours") int estimatedHours,
    List<String> prerequisites, // List of topic IDs that are prerequisites
    List<String> outcomes, // Measurable skills gained
    @JsonProperty("example_exercises") List<String> exampleExercises,
    @JsonProperty("helpful_references") List<SourceReferenceDTO> helpfulReferences,
    List<String> explainability, // Which input sources influenced this topic
    List<TopicDTO> subtopics, // Nested subtopics
    @JsonProperty("learning_resources") List<LearningResourceDTO> learningResources // Curated learning materials for this topic
) {}
