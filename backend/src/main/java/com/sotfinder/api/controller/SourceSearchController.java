package com.sotfinder.api.controller;

import com.sotfinder.api.dto.LLMSearchResponse;
import com.sotfinder.api.service.LLMAuthoritySearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SourceSearchController {

    private final LLMAuthoritySearchService llmAuthoritySearchService;

    public SourceSearchController(LLMAuthoritySearchService llmAuthoritySearchService) {
        this.llmAuthoritySearchService = llmAuthoritySearchService;
    }

    @GetMapping("/search")
    public LLMSearchResponse search(@RequestParam String query) {
        return llmAuthoritySearchService.searchAuthorities(query);
    }
}