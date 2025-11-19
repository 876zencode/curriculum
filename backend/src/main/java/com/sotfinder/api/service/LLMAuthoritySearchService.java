package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sotfinder.api.dto.LLMSearchResponse;
import com.sotfinder.api.dto.SourceDTO;
import com.sotfinder.api.dto.MetadataDTO;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class LLMAuthoritySearchService {

    private final ObjectMapper objectMapper;

    public LLMAuthoritySearchService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public LLMSearchResponse searchAuthorities(String query) {
        // 1. Sanitize user query (basic example)
        String sanitizedQuery = query.toLowerCase().trim();

        // 2. Build the LLM prompt
        String llmPrompt = buildLlmPrompt(sanitizedQuery);
        System.out.println("LLM Prompt:\n" + llmPrompt);

        // 3. Call LLM API - Placeholder for actual LLM integration
        String llmApiResponse = callLlmApi(llmPrompt);
        System.out.println("LLM Raw Response:\n" + llmApiResponse);


        // 4. Validate and parse JSON response
        try {
            // The LLM is instructed to return a JSON array of source objects.
            // We need to wrap it in our LLMSearchResponse structure for the API.
            // For now, we'll simulate the LLM returning a list of SourceDTOs directly
            // and then construct the LLMSearchResponse.
            List<SourceDTO> llmResults = parseLlmResponse(llmApiResponse);
            return new LLMSearchResponse(query, llmResults);
        } catch (IOException e) {
            System.err.println("Error parsing LLM response: " + e.getMessage());
            // In a real application, you'd want more robust error handling
            return new LLMSearchResponse(query, Collections.emptyList());
        }
    }

    private String buildLlmPrompt(String query) {
        // This is the prompt provided in the prompt description
        return "You are an authority-ranking engine for software documentation.\n" +
               "Given a programming language or framework name, return ONLY the most official, canonical, standardized, and widely accepted sources of truth.\n" +
               "Prioritize:\n" +
               "1. Official documentation\n" +
               "2. Language specifications\n" +
               "3. Standards bodies\n" +
               "4. Reference implementations\n" +
               "Never return blogs, courses, Medium articles, or random tutorials.\n" +
               "For each source, include:\n" +
               "* title\n" +
               "* url\n" +
               "* is_official (true/false)\n" +
               "* confidence (0-1)\n" +
               "* short_reasoning\n" +
               "* metadata (age, spec version, relevance, etc.)\n" +
               "Return in a structured JSON array for the query: '%s'.\n" +
               "Example JSON for 'java':\n" +
               "[" +
               "  {\"title\": \"Oracle Java SE Documentation\",\n" +
               "    \"url\": \"https://docs.oracle.com/javase/\",\n" +
               "    \"is_official\": true,\n" +
               "    \"confidence\": 0.98,\n" +
               "    \"reasoning\": \"This is the official documentation published by Oracle.\",\n" +
               "    \"metadata\": {\n" +
               "      \"type\": \"official-docs\",\n" +
               "      \"spec_version\": \"Java SE\",\n" +
               "      \"notes\": \"Canonical source of truth\"\n" +
               "    }\n" +
               "  }\n" +
               "]\n" .formatted(query);
    }

    // THIS IS A MOCK IMPLEMENTATION. REPLACE WITH ACTUAL LLM API CALL.
    private String callLlmApi(String prompt) {
        // In a real scenario, this would involve making an HTTP request to the Gemini API
        // or another LLM provider with the 'prompt'.
        // For demonstration, we return a hardcoded mock response.
        System.out.println("--- MOCKING LLM API CALL ---");
        if ("java".equals(prompt.contains("java") ? "java" : null)) { // Simple check for 'java' in prompt
            return "[" +
                   "  {\"title\": \"Oracle Java SE Documentation\",\n" +
                   "    \"url\": \"https://docs.oracle.com/javase/\",\n" +
                   "    \"is_official\": true,\n" +
                   "    \"confidence\": 0.98,\n" +
                   "    \"reasoning\": \"This is the official documentation published by Oracle.\",\n" +
                   "    \"metadata\": {\n" +
                   "      \"type\": \"official-docs\",\n" +
                   "      \"spec_version\": \"Java SE\",\n" +
                   "      \"notes\": \"Canonical source of truth\"\n" +
                   "    }\n" +
                   "  },\n" +
                   "  {\"title\": \"Java Language Specification (JLS)\",\n" +
                   "    \"url\": \"https://docs.oracle.com/javase/specs/jls/se21/html/index.html\",\n" +
                   "    \"is_official\": true,\n" +
                   "    \"confidence\": 0.95,\n" +
                   "    \"reasoning\": \"The official language specification for Java.\",\n" +
                   "    \"metadata\": {\n" +
                   "      \"type\": \"spec\",\n" +
                   "      \"spec_version\": \"Java SE 21\",\n" +
                   "      \"notes\": \"Defines the language.\"\n" +
                   "    }\n" +
                   "  }\n" +
                   "]" ;
        } else if ("python".equals(prompt.contains("python") ? "python" : null)) { // Simple check for 'python' in prompt
            return "[" +
                   "  {\"title\": \"Python 3.x Documentation\",\n" +
                   "    \"url\": \"https://docs.python.org/3/\",\n" +
                   "    \"is_official\": true,\n" +
                   "    \"confidence\": 0.99,\n" +
                   "    \"reasoning\": \"This is the official documentation for Python 3.x.\",\n" +
                   "    \"metadata\": {\n" +
                   "      \"type\": \"official-docs\",\n" +
                   "      \"spec_version\": \"Python 3.x\",\n" +
                   "      \"notes\": \"Canonical source of truth\"\n" +
                   "    }\n" +
                   "  },\n" +
                   "  {\"title\": \"PEP Index (Python Enhancement Proposals)\",\n" +
                   "    \"url\": \"https://www.python.org/dev/peps/\",\n" +
                   "    \"is_official\": true,\n" +
                   "    \"confidence\": 0.90,\n" +
                   "    \"reasoning\": \"PEPs describe new features and processes for Python.\",\n" +
                   "    \"metadata\": {\n" +
                   "      \"type\": \"standard\",\n" +
                   "      \"spec_version\": \"Various\",\n" +
                   "      \"notes\": \"Community standards and proposals.\"\n" +
                   "    }\n" +
                   "  }\n" +
                   "]" ;
        }
        // Default empty response for other queries
        return "[]";
    }

    private List<SourceDTO> parseLlmResponse(String llmApiResponse) throws IOException {
        // LLM is expected to return a JSON array directly
        return objectMapper.readValue(llmApiResponse, 
                                     objectMapper.getTypeFactory().constructCollectionType(List.class, SourceDTO.class));
    }

    // Instructions for integrating the actual Gemini API:
    // 1. Add Google Cloud / Gemini API client library to your pom.xml (e.g., ai.grakn.platform:gemini-java or spring-ai).
    // 2. Configure your API key securely (e.g., via application.properties or environment variables).
    // 3. Replace the 'callLlmApi' method with logic that:
    //    a. Initializes the Gemini client with your API key.
    //    b. Sends the 'prompt' to the Gemini API (e.g., using text generation models).
    //    c. Extracts the text content from the Gemini response.
    //    d. Returns the extracted text, which should be the JSON string from the LLM.
    //    Example (pseudo-code):
    //    GeminiClient client = new GeminiClient(apiKey);
    //    GenerateContentResponse response = client.generateContent(prompt);
    //    return response.candidates.get(0).content.parts.get(0).text;
    //
    //    Refer to the official Gemini API documentation for the exact client usage.
}
