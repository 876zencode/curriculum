package com.sotfinder.api.language.controller;

import com.sotfinder.api.language.dto.ConsolidatedSourcesDTO;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.dto.SourceBreakdownDTO;
import com.sotfinder.api.language.service.LanguageCurriculumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/language")
public class LanguageController {

    private final LanguageCurriculumService languageCurriculumService;

    public LanguageController(LanguageCurriculumService languageCurriculumService) {
        this.languageCurriculumService = languageCurriculumService;
    }

    /**
     * GET /api/language/{slug}
     * Returns the consolidated canonical sources + curriculum overview for that language.
     * Combines ConsolidatedSourcesDTO and CurriculumDTO into a single response.
     */
    @GetMapping("/{slug}")
    public ResponseEntity<?> getLanguageOverview(@PathVariable String slug) {
        ConsolidatedSourcesDTO consolidatedSources = languageCurriculumService.getConsolidatedSources(slug);
        CurriculumDTO curriculum = languageCurriculumService.getCurriculum(slug);

        if (consolidatedSources == null || curriculum == null) {
            return ResponseEntity.notFound().build();
        }

        // Create a custom response object to return both DTOs in a single response
        return ResponseEntity.ok(new LanguageOverviewResponse(consolidatedSources, curriculum));
    }

    /**
     * GET /api/language/{slug}/sources
     * Returns the grouped canonical sources (title, url, type, steward, confidence).
     */
    @GetMapping("/{slug}/sources")
    public ResponseEntity<ConsolidatedSourcesDTO> getLanguageSources(@PathVariable String slug) {
        ConsolidatedSourcesDTO consolidatedSources = languageCurriculumService.getConsolidatedSources(slug);
        if (consolidatedSources == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(consolidatedSources);
    }

    /**
     * GET /api/language/{slug}/curriculum
     * Returns the curriculum tree (levels, topics, subtopics) and estimated hours.
     */
    @GetMapping("/{slug}/curriculum")
    public ResponseEntity<CurriculumDTO> getLanguageCurriculum(@PathVariable String slug) {
        CurriculumDTO curriculum = languageCurriculumService.getCurriculum(slug);
        if (curriculum == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(curriculum);
    }

    /**
     * GET /api/language/{slug}/sources/{sourceId}/breakdown
     * Returns the Curriculum Breakdown Page data for a single source.
     */
    @GetMapping("/{slug}/sources/{sourceId}/breakdown")
    public ResponseEntity<SourceBreakdownDTO> getSourceBreakdown(
            @PathVariable String slug,
            @PathVariable String sourceId) {
        SourceBreakdownDTO sourceBreakdown = languageCurriculumService.getSourceBreakdown(slug, sourceId);
        if (sourceBreakdown == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sourceBreakdown);
    }

    /**
     * POST /api/language/{slug}/refresh
     * Forces re-evaluation: re-fetch canonical sources (using StaticSourceProvider + optional crawlers)
     * and re-run LLM consolidation (auth required).
     * For now, no actual auth implementation, just a placeholder.
     */
    @PostMapping("/{slug}/refresh")
    public ResponseEntity<ConsolidatedSourcesDTO> refreshLanguageCurriculum(@PathVariable String slug) {
        // In a real application, this would have authentication/authorization
        ConsolidatedSourcesDTO refreshedSources = languageCurriculumService.refreshCurriculum(slug);
        if (refreshedSources == null) {
            return ResponseEntity.internalServerError().build(); // Or other appropriate error
        }
        return ResponseEntity.ok(refreshedSources);
    }

    // Helper DTO for the combined /api/language/{slug} response
    public record LanguageOverviewResponse(
        ConsolidatedSourcesDTO consolidatedSources,
        CurriculumDTO curriculum
    ) {}
}
