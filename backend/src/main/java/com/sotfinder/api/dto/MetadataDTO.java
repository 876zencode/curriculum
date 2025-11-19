package com.sotfinder.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MetadataDTO(
    String type,
    @JsonProperty("spec_version") String specVersion,
    String notes
) {}