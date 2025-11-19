package com.sotfinder.api.dto;

import java.util.List;

public record SearchResponseDTO(
    String query,
    List<RankedResourceDTO> results
) {}