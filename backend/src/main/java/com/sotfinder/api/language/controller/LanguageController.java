package com.sotfinder.api.language.controller;

import com.sotfinder.api.language.dto.CanonicalSourceDTO;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.service.LanguageCurriculumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curriculum")
public class LanguageController {

    private final LanguageCurriculumService languageCurriculumService;

    public LanguageController(LanguageCurriculumService languageCurriculumService) {
        this.languageCurriculumService = languageCurriculumService;
    }

    @GetMapping("/{language}/canonical-sources")
    public ResponseEntity<List<CanonicalSourceDTO>> getCanonicalSources(@PathVariable String language) {
        List<CanonicalSourceDTO> canonicalSources = languageCurriculumService.getCanonicalSources(language);
        if (canonicalSources == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(canonicalSources);
    }

    @GetMapping("/{language}/curriculum")
    public ResponseEntity<CurriculumDTO> getLanguageCurriculum(@PathVariable String language) {
        CurriculumDTO curriculum = languageCurriculumService.getCurriculum(language);
        if (curriculum == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(curriculum);
    }
}
