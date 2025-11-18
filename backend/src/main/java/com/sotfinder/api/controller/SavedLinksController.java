package com.sotfinder.api.controller;

import com.sotfinder.api.dto.SourceDTO;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/sources")
public class SavedLinksController {

    private final Map<String, SourceDTO> savedLinks = new ConcurrentHashMap<>();

    @PostMapping("/save")
    public void save(@RequestBody SourceDTO source) {
        savedLinks.put(source.url(), source);
    }

    @GetMapping("/saved")
    public Collection<SourceDTO> getSaved() {
        return savedLinks.values();
    }
}