package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
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

    @Value("${CURRICULUM_DATA_URL}")
    private String curriculumDataUrl;

    public JsonDataService(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        // curriculumDataUrl is now injected by Spring via @Value
    }

    @PostConstruct
    public void init() {
        fetchCurriculumData();
    }

    @Scheduled(fixedRate = 300000) // 5 minutes
    public void fetchCurriculumData() {
        if (curriculumDataUrl == null) {
            System.err.println("JsonDataService: curriculumDataUrl is null. Cannot fetch curriculum data.");
            return;
        }
        System.out.println("JsonDataService: Attempting to fetch curriculum data from: " + curriculumDataUrl);
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
                            curriculumCache.put(cleanName, node); // Store the entire node
                        }
                    }
                } else {
                    System.err.println("JsonDataService: Fetched data is not a JSON array as expected.");
                }
            } else {
                System.err.println("JsonDataService: Failed to fetch curriculum data. Status code: " + response.statusCode() + ", body: " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            System.err.println("JsonDataService: Exception while fetching curriculum data: " + e.getMessage());
            e.printStackTrace();
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
        Set<String> languages = curriculumCache.keySet();
        System.out.println("JsonDataService: getLanguages() returning " + languages.size() + " languages.");
        return languages;
    }
}
