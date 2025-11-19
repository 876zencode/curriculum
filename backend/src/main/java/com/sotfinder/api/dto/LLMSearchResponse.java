package com.sotfinder.api.dto;

import java.util.List;

public record LLMSearchResponse(
    String query,
    List<SourceDTO> results
) {}