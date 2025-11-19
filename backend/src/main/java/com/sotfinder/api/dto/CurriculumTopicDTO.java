package com.sotfinder.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CurriculumTopicDTO(
    String name,
    String summary,
    int order,
    String category, // e.g., "Fundamentals", "Tooling", "Ecosystem", "Best Practices", "Advanced Concepts"
    List<CurriculumTopicDTO> subtopics // For nested topics
) {}