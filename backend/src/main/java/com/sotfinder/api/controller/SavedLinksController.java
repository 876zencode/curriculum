package com.sotfinder.api.controller;

import com.sotfinder.api.dto.RankedResourceDTO; // Changed DTO import
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class SavedLinksController {

    // Using a ConcurrentHashMap for in-memory storage of saved links
    // The key is the URL to ensure uniqueness
    private final Map<String, RankedResourceDTO> savedLinks = new ConcurrentHashMap<>(); // Changed Map value type

    @PostMapping("/saved")
    public void save(@RequestBody RankedResourceDTO resource) { // Changed parameter type and name
        // In a real application, you might want to add validation
        // and more robust error handling.
        savedLinks.put(resource.url(), resource);
        System.out.println("Saved link: " + resource.url()); // For debugging
    }

    @GetMapping("/saved")
    public Collection<RankedResourceDTO> getSaved() { // Changed return type
        System.out.println("Retrieving " + savedLinks.size() + " saved links."); // For debugging
        return savedLinks.values();
    }
}