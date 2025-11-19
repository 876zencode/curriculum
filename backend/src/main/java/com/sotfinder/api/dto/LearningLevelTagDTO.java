package com.sotfinder.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LearningLevelTagDTO(
    String level, // e.g., "Beginner", "Intermediate", "Advanced"
    String description
) {}