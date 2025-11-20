package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record LearningLevelDTO(
    String level, // e.g., "Beginner", "Intermediate", "Advanced", "Expert"
    @JsonProperty("estimated_hours") int estimatedHours, // Total estimated hours for this level
    List<TopicDTO> topics
) {}