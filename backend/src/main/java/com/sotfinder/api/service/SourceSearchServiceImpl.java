package com.sotfinder.api.service;

import com.sotfinder.api.dto.SourceDTO;
import com.sotfinder.api.model.RankedSourceResult;
import com.sotfinder.api.provider.SourceProvider;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SourceSearchServiceImpl implements SourceSearchService {

    private final SourceProvider sourceProvider;
    private final SourceRankingService rankingService;

    public SourceSearchServiceImpl(SourceProvider sourceProvider, SourceRankingService rankingService) {
        this.sourceProvider = sourceProvider;
        this.rankingService = rankingService;
    }

    @Override
    public List<SourceDTO> searchSources(String query) {
        return sourceProvider.fetchRawResults(query).stream()
                .map(rankingService::rank)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private SourceDTO toDTO(RankedSourceResult rankedResult) {
        return new SourceDTO(rankedResult.title(), rankedResult.url(), rankedResult.authorityScore(), rankedResult.reason());
    }
}