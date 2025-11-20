package com.sotfinder.api.language.service;

import com.sotfinder.api.language.dto.CanonicalSourceDTO;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SourceMergerService {

    /**
     * Simulates fetching and merging/deduplicating raw sources for a given language.
     * In a real application, this would involve calling StaticSourceProvider,
     * other crawlers, and potentially a steward registry.
     *
     * @param language The programming language or framework.
     * @return A list of unique CanonicalSourceDTOs.
     */
    public List<CanonicalSourceDTO> getMergedAndDeduplicatedSources(String language) {
        // Step 1: Simulate fetching raw sources (replace with actual calls to providers)
        List<String> rawUrls = simulateRawSourceFetching(language);

        // Step 2: Deduplicate and normalize URLs
        Map<String, CanonicalSourceDTO> uniqueSources = new ConcurrentHashMap<>();

        for (String rawUrl : rawUrls) {
            try {
                URL url = new URL(rawUrl);
                // Use a normalized key for deduplication (e.g., host + path without query/fragment)
                String normalizedKey = url.getHost() + url.getPath();

                if (!uniqueSources.containsKey(normalizedKey)) {
                    // For POC, create a basic CanonicalSourceDTO.
                    // Real implementation would extract more details or use a source registry.
                    String id = generateSourceId(url);
                    String title = inferTitleFromUrl(url); // Simple inference
                    String steward = inferStewardFromUrl(url); // Simple inference
                    String type = inferTypeFromUrl(url); // Simple inference

                    CanonicalSourceDTO canonicalSource = new CanonicalSourceDTO(
                        id,
                        title,
                        rawUrl, // Keep original URL
                        steward,
                        type,
                        0.0, // Confidence will be set by LLM
                        "" // Short summary will be set by LLM
                    );
                    uniqueSources.put(normalizedKey, canonicalSource);
                }
            } catch (MalformedURLException e) {
                System.err.println("Invalid URL encountered: " + rawUrl + " - " + e.getMessage());
            }
        }
        return new ArrayList<>(uniqueSources.values());
    }

    private List<String> simulateRawSourceFetching(String language) {
        // In a real scenario, this would aggregate from StaticSourceProvider, crawlers, etc.
        if (language.equalsIgnoreCase("java")) {
            return Arrays.asList(
                "https://docs.oracle.com/javase/tutorial/",
                "https://www.oracle.com/java/", // Similar domain, should be deduplicated or linked
                "https://www.baeldung.com/java-basics",
                "https://www.baeldung.com/spring-framework-tutorial", // Another Baeldung page
                "https://www.spring.io/guides",
                "https://openjdk.org/jeps/", // OpenJDK JEPs
                "https://www.jetbrains.com/academy/track/java" // Example academy
            );
        } else if (language.equalsIgnoreCase("react")) {
            return Arrays.asList(
                "https://react.dev/learn",
                "https://react.dev/reference/react",
                "https://www.freecodecamp.org/news/react-tutorial-for-beginners-a-complete-introduction/",
                "https://www.youtube.com/watch?v=some_react_tutorial" // Example video, might be filtered by LLM later
            );
        }
        return Collections.emptyList();
    }

    private String generateSourceId(URL url) {
        String host = url.getHost().replace(".", "-");
        // Get path, remove leading/trailing slashes, replace internal slashes with hyphens
        String path = url.getPath().replaceAll("^/|/$", "").replace("/", "-");
        // If path is empty after normalization, use a default
        if (path.isEmpty()) {
            path = "root";
        }
        return (host + "-" + path).toLowerCase();
    }

    private String inferTitleFromUrl(URL url) {
        // Very basic inference, LLM will provide better.
        String host = url.getHost();
        if (host.contains("oracle.com")) return "Oracle Documentation";
        if (host.contains("baeldung.com")) return "Baeldung Tutorials";
        if (host.contains("spring.io")) return "Spring Guides";
        if (host.contains("openjdk.org")) return "OpenJDK Documentation";
        if (host.contains("jetbrains.com")) return "JetBrains Academy";
        if (host.contains("react.dev")) return "React Official Documentation";
        if (host.contains("freecodecamp.org")) return "FreeCodeCamp";
        return "Unknown Source";
    }

    private String inferStewardFromUrl(URL url) {
        String host = url.getHost();
        if (host.contains("oracle.com")) return "Oracle";
        if (host.contains("baeldung.com")) return "Baeldung";
        if (host.contains("spring.io")) return "Spring";
        if (host.contains("openjdk.org")) return "OpenJDK";
        if (host.contains("jetbrains.com")) return "JetBrains";
        if (host.contains("react.dev")) return "Meta"; // React is maintained by Meta
        if (host.contains("freecodecamp.org")) return "FreeCodeCamp";
        return "Community";
    }

    private String inferTypeFromUrl(URL url) {
        String host = url.getHost();
        String path = url.getPath();
        if (host.contains("oracle.com") && path.contains("tutorial")) return "Official Tutorial";
        if (host.contains("oracle.com") || host.contains("openjdk.org") || host.contains("react.dev")) return "Official Docs";
        if (host.contains("baeldung.com") || host.contains("freecodecamp.org")) return "Community Tutorial";
        if (host.contains("spring.io") && path.contains("guides")) return "Official Guides";
        if (host.contains("jetbrains.com")) return "Learning Platform";
        return "General Resource";
    }
}
