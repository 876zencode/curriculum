package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sotfinder.api.language.dto.CurriculumDTO;

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
public class OpenAILLMService implements LLMService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    @Value("${LLM_API_KEY}")
    private String llmApiKey;
    @Value("${LLM_MODEL}")
    private String llmModel;

    public OpenAILLMService(ObjectMapper objectMapper, ResourceLoader resourceLoader) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
        // llmApiKey and llmModel are now injected by Spring via @Value
    }

    @Override
    public CurriculumDTO generateCurriculum(String language, String curriculumData) {
        try {
            String prompt = loadPrompt();
            String formattedPrompt = prompt.replace("{curriculumData}", curriculumData);

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
                int firstBrace = jsonResponse.indexOf('{');
                int lastBrace = jsonResponse.lastIndexOf('}');

                if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                    jsonResponse = jsonResponse.substring(firstBrace, lastBrace + 1);
                } else {
                    // If no valid JSON object found, try stripping markdown code block anyway as a
                    // fallback
                    if (jsonResponse.startsWith("```json")) {
                        jsonResponse = jsonResponse.substring(jsonResponse.indexOf("```json") + 7);
                        if (jsonResponse.endsWith("```")) {
                            jsonResponse = jsonResponse.substring(0, jsonResponse.lastIndexOf("```"));
                        }
                    }
                }
                jsonResponse = jsonResponse.trim(); // Trim any remaining whitespace

                return objectMapper.readValue(jsonResponse, CurriculumDTO.class);
            } else {
                throw new RuntimeException("Failed to generate curriculum from LLM. Status code: "
                        + response.statusCode() + ", body: " + response.body());
            }

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to generate curriculum from LLM", e);
        }
    }

    private String loadPrompt() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:prompts/llm_curriculum_generation_prompt.txt");
        try (InputStream inputStream = resource.getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
