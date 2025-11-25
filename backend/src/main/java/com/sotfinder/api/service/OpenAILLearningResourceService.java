package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sotfinder.api.language.dto.LearningResourceDTO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class OpenAILLearningResourceService implements LearningResourceService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    @Value("${LLM_API_KEY}")
    private String llmApiKey;
    @Value("${LLM_MODEL}")
    private String llmModel;

    public OpenAILLearningResourceService(ObjectMapper objectMapper, ResourceLoader resourceLoader) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
        // llmApiKey and llmModel are now injected by Spring via @Value
    }

    @Override
    public List<LearningResourceDTO> generateLearningResources(String language, String subtopicTitle, JsonNode trustProfileData) {
        try {
            String prompt = loadPrompt();
            String formattedPrompt = prompt
                    .replace("{language}", language)
                    .replace("{subtopicTitle}", subtopicTitle)
                    .replace("{trustProfileData}", trustProfileData.toString());

            OpenAIRequest.Message message = new OpenAIRequest.Message("user", formattedPrompt);
            OpenAIRequest openAIRequest = new OpenAIRequest(llmModel, List.of(message));

            String requestBody = objectMapper.writeValueAsString(openAIRequest);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + llmApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                OpenAIResponse openAIResponse = objectMapper.readValue(response.body(), OpenAIResponse.class);
                String jsonResponse = openAIResponse.choices().get(0).message().content();

                // More robust JSON extraction: find the first '{' and last '}'
                int firstBrace = jsonResponse.indexOf('['); // Expecting a JSON array
                int lastBrace = jsonResponse.lastIndexOf(']');
                
                if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                    jsonResponse = jsonResponse.substring(firstBrace, lastBrace + 1);
                } else {
                    // Fallback for markdown code block if direct JSON array extraction fails
                    if (jsonResponse.startsWith("```json")) {
                        jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```json") + 7);
                        if (jsonResponse.endsWith("```")) {
                            jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
                        }
                    }
                }
                jsonResponse = jsonResponse.trim();

                // Deserialize into a List of LearningResourceDTO
                return objectMapper.readValue(jsonResponse, objectMapper.getTypeFactory().constructCollectionType(List.class, LearningResourceDTO.class));
            } else {
                throw new RuntimeException("Failed to generate learning resources from LLM. Status code: " + response.statusCode() + ", body: " + response.body());
            }

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to generate learning resources from LLM", e);
        }
    }

    private String loadPrompt() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:prompts/llm_learning_resources_generation_prompt.txt");
        try (InputStream inputStream = resource.getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}