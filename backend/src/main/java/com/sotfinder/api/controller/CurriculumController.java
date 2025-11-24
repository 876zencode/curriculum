package com.sotfinder.api.controller;

import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.service.LanguageCurriculumService;
import com.sotfinder.api.service.JsonDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/curriculum")
public class CurriculumController { // Renamed from MetadataController

    private final JsonDataService jsonDataService;
    private final LanguageCurriculumService languageCurriculumService; // Injected

    public CurriculumController(JsonDataService jsonDataService, LanguageCurriculumService languageCurriculumService) {
        this.jsonDataService = jsonDataService;
        this.languageCurriculumService = languageCurriculumService;
    }

    @GetMapping("/metadata")
    public ResponseEntity<Set<String>> getLanguages() {
        return ResponseEntity.ok(jsonDataService.getLanguages());
    }

    @GetMapping("/{language}/learning-resources")
    public ResponseEntity<CurriculumDTO> getLearningResources(@PathVariable String language) {
        CurriculumDTO curriculum = languageCurriculumService.getCurriculum(language);
        if (curriculum != null) {
            return ResponseEntity.ok(curriculum);
        }
        return ResponseEntity.notFound().build();
    }

    // Existing /curriculum/{language}/curriculum endpoint should also return the unified CurriculumDTO
    @GetMapping("/{language}/curriculum")
    public ResponseEntity<CurriculumDTO> getCurriculum(@PathVariable String language) {
        CurriculumDTO curriculum = languageCurriculumService.getCurriculum(language);
        if (curriculum != null) {
            return ResponseEntity.ok(curriculum);
        }
        return ResponseEntity.notFound().build();
    }
}
