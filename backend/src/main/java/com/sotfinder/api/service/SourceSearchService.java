package com.sotfinder.api.service;

import com.sotfinder.api.dto.SourceDTO;
import java.util.List;

public interface SourceSearchService {
    List<SourceDTO> searchSources(String query);
}