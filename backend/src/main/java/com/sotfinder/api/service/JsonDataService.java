package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JsonDataService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, JsonNode> curriculumCache = new ConcurrentHashMap<>();

    private String curriculumDataUrl;

    public JsonDataService(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.curriculumDataUrl = System.getProperty("CURRICULUM_DATA_URL");
    }

    @PostConstruct
    public void init() {
        fetchCurriculumData();
    }

    @Scheduled(fixedRate = 300000) // 5 minutes
    public void fetchCurriculumData() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(curriculumDataUrl))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode rootNode = objectMapper.readTree(response.body());
                if (rootNode.isArray()) {
                    for (JsonNode node : rootNode) {
                        if (node.has("name")) {
                            String name = node.get("name").asText();
                            String cleanName = cleanLanguageIdentifier(name);
                            if (node.has("topics")) {
                                curriculumCache.put(cleanName, node.get("topics"));
                            }
                        }
                    }
                } else {
                    // Handle non-array root node if necessary, or throw an error
                    // For now, let's assume it's always an array as per the curl output
                }
            } else {
                // Handle non-200 responses
            }
        } catch (IOException | InterruptedException e) {
            // Handle exceptions
        }
    }

    private String cleanLanguageIdentifier(String name) {
        String cleanedName = name.toLowerCase();
        
        // Remove common descriptive phrases
        cleanedName = cleanedName.replace(" developer path", "");
        cleanedName = cleanedName.replace(" basics", "");
        cleanedName = cleanedName.replace(" frontend", "");
        cleanedName = cleanedName.replace(" backend", "");
        cleanedName = cleanedName.replace(" learning path", "");
        
        // Replace spaces and non-alphanumeric characters (except + for C++) with hyphens
        cleanedName = cleanedName.replaceAll("[^a-z0-9+]+", "-");
        
        // Remove leading/trailing hyphens
        cleanedName = cleanedName.replaceAll("^-|-$", "");
        
        return cleanedName;
    }

    public JsonNode getCurriculumData(String language) {
        return curriculumCache.get(language.toLowerCase());
    }

    public Set<String> getLanguages() {
        return curriculumCache.keySet();
    }
}
