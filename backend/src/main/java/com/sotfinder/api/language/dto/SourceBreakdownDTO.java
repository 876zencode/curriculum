package com.sotfinder.api.language.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public record SourceBreakdownDTO(
    String sourceId, // Corresponds to CanonicalSourceDTO.id
    String title,
    String url,
    String summary, // AI-generated summary of this source's content
    @JsonProperty("extracted_topics") List<TopicDTO> extractedTopics, // Topics directly extracted from this source
    List<SourceReferenceDTO> references // References found within this source
) {}