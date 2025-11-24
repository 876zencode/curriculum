package com.sotfinder.api.controller;

import com.sotfinder.api.service.JsonDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/curriculum")
public class MetadataController {

    private final JsonDataService jsonDataService;

    public MetadataController(JsonDataService jsonDataService) {
        this.jsonDataService = jsonDataService;
    }

    @GetMapping("/metadata")
    public ResponseEntity<Set<String>> getLanguages() {
        return ResponseEntity.ok(jsonDataService.getLanguages());
    }
}
