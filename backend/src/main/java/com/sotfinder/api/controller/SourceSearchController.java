package com.sotfinder.api.controller;

import com.sotfinder.api.dto.SourceDTO;
import com.sotfinder.api.service.SourceSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sources")
public class SourceSearchController {

    private final SourceSearchService searchService;

    public SourceSearchController(SourceSearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/search")
    public List<SourceDTO> search(@RequestParam String query) {
        return searchService.searchSources(query);
    }
}