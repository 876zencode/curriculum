package com.sotfinder.api.controller;

import com.sotfinder.api.dto.SearchResponseDTO; // Changed DTO import
import com.sotfinder.api.service.LLMCurriculumEvaluationService; // Changed service import
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SourceSearchController {

    private final LLMCurriculumEvaluationService llmCurriculumEvaluationService; // Changed injected service

    public SourceSearchController(LLMCurriculumEvaluationService llmCurriculumEvaluationService) {
        this.llmCurriculumEvaluationService = llmCurriculumEvaluationService;
    }

    @GetMapping("/search")
    public SearchResponseDTO search(@RequestParam String query) { // Changed return type
        return llmCurriculumEvaluationService.evaluateCurriculum(query); // Changed method call
    }
}