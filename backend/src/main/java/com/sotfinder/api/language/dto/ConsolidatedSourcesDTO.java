package com.sotfinder.api.language.dto;

import java.util.List;

public record ConsolidatedSourcesDTO(
    String language,
    String headline, // e.g., "Java — Canonical Learning Hub"
    List<CanonicalSourceDTO> sources
) {}