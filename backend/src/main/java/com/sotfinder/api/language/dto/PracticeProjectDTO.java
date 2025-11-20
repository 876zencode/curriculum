package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PracticeProjectDTO(
    String title,
    String description,
    String difficulty, // e.g., "Beginner", "Intermediate"
    @JsonProperty("estimated_hours") int estimatedHours,
    List<String> outcomes // Skills gained from completing this project
) {}