package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SourceReferenceDTO(
    String sourceId, // Refers to CanonicalSourceDTO.id
    String url, // Direct URL to the relevant section if possible
    String snippet, // Short text excerpt from the source that supports this topic/evidence
    @JsonProperty("short_evidence") String shortEvidence // AI-generated short evidence line
) {}