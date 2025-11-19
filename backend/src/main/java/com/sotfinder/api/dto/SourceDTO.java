package com.sotfinder.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SourceDTO(
    String title,
    String url,
    @JsonProperty("is_official") boolean isOfficial,
    double confidence,
    String reasoning,
    MetadataDTO metadata
) {}