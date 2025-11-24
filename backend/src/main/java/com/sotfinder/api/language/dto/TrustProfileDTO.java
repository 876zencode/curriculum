package com.sotfinder.api.language.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

// Nested DTO for weights
record WeightsDTO(
    double authority,
    double recency,
    double clarity,
    double depth
) {}

public record TrustProfileDTO(
    WeightsDTO weights,
    @JsonProperty("preferredSources") List<String> preferredSources,
    @JsonProperty("discouragedSources") List<String> discouragedSources
) {}