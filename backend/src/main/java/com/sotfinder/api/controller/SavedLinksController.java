package com.sotfinder.api.controller;

import com.sotfinder.api.dto.SourceDTO;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class SavedLinksController {

    // Using a ConcurrentHashMap for in-memory storage of saved links
    // The key is the URL to ensure uniqueness
    private final Map<String, SourceDTO> savedLinks = new ConcurrentHashMap<>();

    @PostMapping("/saved")
    public void save(@RequestBody SourceDTO source) {
        // In a real application, you might want to add validation
        // and more robust error handling.
        savedLinks.put(source.url(), source);
        System.out.println("Saved link: " + source.url()); // For debugging
    }

    @GetMapping("/saved")
    public Collection<SourceDTO> getSaved() {
        System.out.println("Retrieving " + savedLinks.size() + " saved links."); // For debugging
        return savedLinks.values();
    }
}