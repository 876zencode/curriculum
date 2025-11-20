package com.sotfinder.api.language.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sotfinder.api.language.dto.CanonicalSourceDTO;
import com.sotfinder.api.language.dto.ConsolidatedSourcesDTO;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.dto.LearningLevelDTO;
import com.sotfinder.api.language.dto.PracticeProjectDTO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LLMCurriculumGenerationService {

    private final ObjectMapper objectMapper;
    // private final ChatClient chatClient; // Uncomment and inject for actual LLM integration

    @Value("classpath:prompts/llm_curriculum_generation_prompt.txt")
    private Resource llmPromptTemplateResource;

    public LLMCurriculumGenerationService(ObjectMapper objectMapper /*, ChatClient chatClient */) {
        this.objectMapper = objectMapper;
        this.objectMapper.registerModule(new JavaTimeModule()); // Register module for LocalDateTime
        // this.chatClient = chatClient;
    }

    /**
     * Generates a curriculum and consolidates sources for a given language using an LLM.
     *
     * @param language The programming language/framework.
     * @param sourceCandidates A list of raw source candidates obtained from merger service.
     * @return A map containing ConsolidatedSourcesDTO and CurriculumDTO.
     */
    public LLMGeneratedCurriculum generateCurriculum(String language, List<CanonicalSourceDTO> sourceCandidates) {
        String sourceCandidatesJson = sourceCandidates.stream()
            .map(s -> {
                try {
                    return objectMapper.writeValueAsString(s);
                } catch (IOException e) {
                    return "{}"; // Should not happen with valid DTOs
                }
            })
            .collect(Collectors.joining(", ", "[", "]"));

        String llmPrompt = buildLlmPrompt(language, sourceCandidatesJson);
        System.out.println("LLM Prompt:\n" + llmPrompt);

        // Call LLM API - Placeholder for actual LLM integration
        String llmApiResponse = callLlmApi(llmPrompt, language);
        System.out.println("LLM Raw Response:\n" + llmApiResponse);

        try {
            // Parse the combined JSON response
            JsonNode rootNode = objectMapper.readTree(llmApiResponse);
            ConsolidatedSourcesDTO consolidatedSources = objectMapper.treeToValue(rootNode.get("consolidated_sources"), ConsolidatedSourcesDTO.class);
            CurriculumDTO curriculumOverview = objectMapper.treeToValue(rootNode.get("curriculum_overview"), CurriculumDTO.class);

            // TODO: Implement schema validation for LLM output here
            validateLLMOutput(consolidatedSources, curriculumOverview);

            return new LLMGeneratedCurriculum(consolidatedSources, curriculumOverview);
        } catch (IOException e) {
            System.err.println("Error parsing LLM response or validation failed: " + e.getMessage());
            // In a real application, fallback to pre-existing static mock output and alert admin
            return fallbackToStaticMock(language);
        }
    }

    private String buildLlmPrompt(String language, String sourceCandidatesJson) {
        try (java.io.InputStream inputStream = llmPromptTemplateResource.getInputStream()) {
            String template = new String(inputStream.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            return template
                .replace("{language}", language)
                .replace("{source_candidates_json}", sourceCandidatesJson)
                .replace("{current_datetime}", LocalDateTime.now().toString());
        } catch (IOException e) {
            System.err.println("Error reading LLM prompt template: " + e.getMessage());
            return "Error generating prompt."; // Fallback prompt
        }
    }


    // THIS IS A MOCK IMPLEMENTATION. REPLACE WITH ACTUAL LLM API CALL.
    // This mock returns a combined JSON object with consolidated_sources and curriculum_overview
    private String callLlmApi(String promptContent, String language) {
        System.out.println("--- MOCKING LLM API CALL (Curriculum Generation) ---");
        // The mock response must be a single JSON object with two top-level keys
        if (language.equalsIgnoreCase("java")) {
            return "{\n" +
                  "  \"consolidated_sources\": {\n" +
                    "    \"language\": \"java\",\n" +
                    "    \"headline\": \"Java — The Definitive Learning Path for Developers\",\n" +
                    "    \"sources\": [\n" +
                      "      {\n" +
                        "        \"id\": \"oracle-java-tutorial\",\n" +
                        "        \"title\": \"Oracle Java Tutorials\",\n" +
                        "        \"url\": \"https://docs.oracle.com/javase/tutorial/\",\n" +
                        "        \"steward\": \"Oracle\",\n" +
                        "        \"type\": \"Official Documentation\",\n" +
                        "        \"confidence\": 0.98,\n" +
                        "        \"short_summary\": \"The official and comprehensive guide from Oracle, covering core Java concepts, GUI programming, and advanced features. Excellent for foundational learning.\"\n" +
                      "      },\n" +
                      "      {\n" +
                        "        \"id\": \"openjdk-docs\",\n" +
                        "        \"title\": \"OpenJDK Documentation & JEPs\",\n" +
                        "        \"url\": \"https://openjdk.org/jeps/\",\n" +
                        "        \"steward\": \"OpenJDK Community\",\n" +
                        "        \"type\": \"Specification & Reference\",\n" +
                        "        \"confidence\": 0.95,\n" +
                        "        \"short_summary\": \"Direct access to Java Enhancement Proposals (JEPs) and other core OpenJDK documentation, crucial for understanding language evolution and internals.\"\n" +
                      "      },\n" +
                      "      {\n" +
                        "        \"id\": \"baeldung-java\",\n" +
                        "        \"title\": \"Baeldung Java & Spring Tutorials\",\n" +
                        "        \"url\": \"https://www.baeldung.com/java-basics\",\n" +
                        "        \"steward\": \"Baeldung\",\n" +
                        "        \"type\": \"Community Tutorial & Guides\",\n" +
                        "        \"confidence\": 0.93,\n" +
                        "        \"short_summary\": \"A highly respected community resource offering practical, in-depth tutorials and guides on Java, Spring, and related technologies, focusing on real-world application.\"\n" +
                      "      },\n" +
                      "      {\n" +
                        "        \"id\": \"spring-guides\",\n" +
                        "        \"title\": \"Spring Guides\",\n" +
                        "        \"url\": \"https://www.spring.io/guides\",\n" +
                        "        \"steward\": \"Broadcom (Spring)\",\n" +
                        "        \"type\": \"Official Guides\",\n" +
                        "        \"confidence\": 0.90,\n" +
                        "        \"short_summary\": \"Official guides from the Spring team for building various applications with the Spring framework. Hands-on, task-oriented learning.\"\n" +
                      "      },\n" +
                      "      {\n" +
                        "        \"id\": \"jetbrains-academy-java\",\n" +
                        "        \"title\": \"JetBrains Academy: Java Track\",\n" +
                        "        \"url\": \"https://www.jetbrains.com/academy/track/java\",\n" +
                        "        \"steward\": \"JetBrains\",\n" +
                        "        \"type\": \"Interactive Learning Platform\",\n" +
                        "        \"confidence\": 0.85,\n" +
                        "        \"short_summary\": \"An interactive, project-based learning platform from the creators of IntelliJ IDEA, offering a structured path to learn Java with coding exercises and practical projects.\"\n" +
                      "      }\n" +
                    "    ]\n" +
                  "  },\n" +
                  "  \"curriculum_overview\": {\n" +
                    "    \"language\": \"java\",\n" +
                    "    \"model_version\": \"Gemini-1.5-Pro-Mock-v1\",\n" +
                    "    \"overall_learning_path\": [\n" +
                      "      {\n" +
                        "        \"level\": \"Beginner\",\n" +
                        "        \"estimated_hours\": 40,\n" +
                        "        \"topics\": [\n" +
                          "          {\n" +
                            "            \"id\": \"java-intro\",\n" +
                            "            \"title\": \"Java Environment & Basic Syntax\",\n" +
                            "            \"description\": \"Understand JVM, JRE, JDK. Set up IntelliJ IDEA. Learn basic data types, variables, operators, and control flow (if/else, loops).\",\n" +
                            "            \"order\": 1,\n" +
                            "            \"estimated_hours\": 8,\n" +
                            "            \"prerequisites\": [],\n" +
                            "            \"outcomes\": [\"Set up Java development environment\", \"Write simple Java programs\", \"Understand basic control structures\"],\n" +
                            "            \"example_exercises\": [\"Calculate factorial of a number\", \"FizzBuzz challenge\", \"Simple calculator program\"],\n" +
                            "            \"helpful_references\": [\n" +
                              "              { \"sourceId\": \"oracle-java-tutorial\", \"url\": \"https://docs.oracle.com/javase/tutorial/getStarted/index.html\", \"snippet\": \"Setting Up Your Development Environment\", \"short_evidence\": \"Oracle's guide to JDK installation.\" }\n" +
                            "            ],\n" +
                            "            \"explainability\": [\"Inspired by Oracle's 'Getting Started' and JetBrains Academy's initial modules.\"],\n" +
                            "            \"subtopics\": []\n" +
                          "          },\n" +
                          "          {\n" +
                            "            \"id\": \"java-oop-fundamentals\",\n" +
                            "            \"title\": \"Object-Oriented Programming (OOP) Fundamentals\",\n" +
                            "            \"description\": \"Master classes, objects, constructors, encapsulation, inheritance, polymorphism, and abstraction. Learn to model real-world entities.\",\n" +
                            "            \"order\": 2,\n" +
                            "            \"estimated_hours\": 12,\n" +
                            "            \"prerequisites\": [\"java-intro\"],\n" +
                            "            \"outcomes\": [\"Design and implement classes and objects\", \"Apply inheritance and polymorphism\", \"Understand encapsulation principles\"],\n" +
                            "            \"example_exercises\": [\"Design a 'Vehicle' hierarchy\", \"Implement a 'Library Management' system\", \"Create an 'Animal' interface with multiple implementations\"],\n" +
                            "            \"helpful_references\": [\n" +
                              "              { \"sourceId\": \"oracle-java-tutorial\", \"url\": \"https://docs.oracle.com/javase/tutorial/java/concepts/index.html\", \"snippet\": \"Learning the Java Language: Classes and Objects\", \"short_evidence\": \"Core OOP concepts explained by Oracle.\" },\n" +
                              "              { \"sourceId\": \"baeldung-java\", \"url\": \"https://www.baeldung.com/java-inheritance-composition-aggregation\", \"snippet\": \"Java Inheritance, Composition, Aggregation\", \"short_evidence\": \"Baeldung provides practical OOP examples.\" }\n" +
                            "            ],\n" +
                            "            \"explainability\": [\"Core OOP from Oracle Tutorials, reinforced by Baeldung's practical take.\"],\n" +
                            "            \"subtopics\": []\n" +
                          "          }\n" +
                        "        ]\n" +
                      "      },\n" +
                      "      {\n" +
                        "        \"level\": \"Intermediate\",\n" +
                        "        \"estimated_hours\": 60,\n" +
                        "        \"topics\": [\n" +
                          "          {\n" +
                            "            \"id\": \"java-collections-generics\",\n" +
                            "            \"title\": \"Collections Framework & Generics\",\n" +
                            "            \"description\": \"Explore List, Set, Map interfaces and their implementations. Understand type safety with Generics and their application.\",\n" +
                            "            \"order\": 1,\n" +
                            "            \"estimated_hours\": 15,\n" +
                            "            \"prerequisites\": [\"java-oop-fundamentals\"],\n" +
                            "            \"outcomes\": [\"Effectively use Java Collections\", \"Write type-safe code with Generics\", \"Choose appropriate collection for a task\"],\n" +
                            "            \"example_exercises\": [\"Implement a custom data structure (e.g., Stack)\", \"Create a generic utility method for collections\", \"Analyze performance of different List implementations\"],\n" +
                            "            \"helpful_references\": [\n" +
                              "              { \"sourceId\": \"oracle-java-tutorial\", \"url\": \"https://docs.oracle.com/javase/tutorial/collections/index.html\", \"snippet\": \"Collections Framework\", \"short_evidence\": \"Oracle's comprehensive guide to Collections.\" }\n" +
                            "            ],\n" +
                            "            \"explainability\": [\"Primarily from Oracle's Collections tutorial.\"],\n" +
                            "            \"subtopics\": []\n" +
                          "          },\n" +
                          "          {\n" +
                            "            \"id\": \"java-io-nio-exceptions\",\n" +
                            "            \"title\": \"I/O, NIO.2 & Exception Handling\",\n" +
                            "            \"description\": \"Learn file operations, streams, buffered I/O, and new I/O APIs. Implement robust exception handling strategies (try-with-resources).\",\n" +
                            "            \"order\": 2,\n" +
                            "            \"estimated_hours\": 12,\n" +
                            "            \"prerequisites\": [\"java-collections-generics\"],\n" +
                            "            \"outcomes\": [\"Read/write files efficiently\", \"Handle common exceptions gracefully\", \"Utilize NIO.2 for file system interaction\"],\n" +
                            "            \"example_exercises\": [\"Copy files/directories\", \"Log application errors to a file\", \"Process CSV data from a file\"],\n" +
                            "            \"helpful_references\": [],\n" +
                            "            \"explainability\": [\"Fundamental topics covered in most intermediate Java curricula.\"],\n" +
                            "            \"subtopics\": []\n" +
                          "          }\n" +
                        "        ]\n" +
                      "      },\n" +
                      "       {\n" +
                        "        \"level\": \"Advanced\",\n" +
                        "        \"estimated_hours\": 80,\n" +
                        "        \"topics\": [\n" +
                          "          {\n" +
                            "            \"id\": \"java-concurrency\",\n" +
                            "            \"title\": \"Concurrency & Parallel Programming\",\n" +
                            "            \"description\": \"Deep dive into threads, executors, synchronized blocks, locks, and atomic operations. Understand concurrency issues and solutions.\",\n" +
                            "            \"order\": 1,\n" +
                            "            \"estimated_hours\": 20,\n" +
                            "            \"prerequisites\": [\"java-io-nio-exceptions\"],\n" +
                            "            \"outcomes\": [\"Write thread-safe Java applications\", \"Utilize ExecutorService for task management\", \"Debug concurrency issues\"],\n" +
                            "            \"example_exercises\": [\"Implement a producer-consumer problem\", \"Create a concurrent web crawler\", \"Design a simple thread pool\"],\n" +
                            "            \"helpful_references\": [],\n" +
                            "            \"explainability\": [\"Advanced topic, critical for high-performance Java applications.\"],\n" +
                            "            \"subtopics\": []\n" +
                          "          }\n" +
                        "        ]\n" +
                      "      },\n" +
                      "      {\n" +
                        "        \"level\": \"Expert\",\n" +
                        "        \"estimated_hours\": 100,\n" +
                        "        \"topics\": [\n" +
                          "          {\n" +
                            "            \"id\": \"java-performance-tuning\",\n" +
                            "            \"title\": \"JVM Internals & Performance Tuning\",\n" +
                            "            \"description\": \"Understand Garbage Collection mechanisms, memory management, and profiling tools. Optimize Java application performance.\",\n" +
                            "            \"order\": 1,\n" +
                            "            \"estimated_hours\": 25,\n" +
                            "            \"prerequisites\": [\"java-concurrency\"],\n" +
                            "            \"outcomes\": [\"Profile and identify performance bottlenecks\", \"Optimize GC behavior\", \"Understand JVM memory model\"],\n" +
                            "            \"example_exercises\": [\"Analyze memory usage of a large application\", \"Tune GC settings for a specific workload\", \"Refactor code for performance gains\"],\n" +
                            "            \"helpful_references\": [],\n" +
                            "            \"explainability\": [\"Expert-level knowledge for highly optimized Java systems.\"],\n" +
                            "            \"subtopics\": []\n" +
                          "          }\n" +
                        "        ]\n" +
                      "      }\n" +
                    "    ],\n" +
                    "    \"recommendations\": {\n" +
                      "      \"coreSources\": [\"oracle-java-tutorial\", \"baeldung-java\", \"spring-guides\"],\n" +
                      "      \"supplementalSources\": [\"openjdk-docs\", \"jetbrains-academy-java\"],\n" +
                      "      \"practiceProjects\": [\n" +
                        "        {\n" +
                          "          \"title\": \"Spring Boot REST API with JPA\",\n" +
                          "          \"description\": \"Build a RESTful API using Spring Boot, Spring Data JPA, and an in-memory database. Implement CRUD operations for a resource.\",\n" +
                          "          \"difficulty\": \"Intermediate\",\n" +
                          "          \"estimated_hours\": 20,\n" +
                          "          \"outcomes\": [\"Build REST APIs\", \"Use Spring Boot\", \"Interact with databases using JPA\"]\n" +
                        "        },\n" +
                        "        {\n" +
                          "          \"title\": \"Multi-threaded Web Crawler\",\n" +
                          "          \"description\": \"Develop a Java application that crawls websites concurrently, extracts links, and stores data. Focus on thread safety and performance.\",\n" +
                          "          \"difficulty\": \"Advanced\",\n" +
                          "          \"estimated_hours\": 30,\n" +
                          "          \"outcomes\": [\"Apply concurrency best practices\", \"Handle network I/O\", \"Manage thread pools\"]\n" +
                        "        }\n" +
                      "      ]\n" +
                    "    },\n" +
                    "    \"explanation\": \"The curriculum prioritizes official documentation (Oracle) for foundational concepts, Baeldung for practical examples and Spring integration, and Spring Guides for framework-specific learning. Topics are ordered logically from basics to advanced, emphasizing measurable skills and practical application.\"\n" +
                  "  }\n" +
                "}";
        }
        return "{}";
    }

    private void validateLLMOutput(ConsolidatedSourcesDTO consolidatedSources, CurriculumDTO curriculumOverview) throws IOException {
        // Basic validation for now: check if essential fields are not null/empty
        if (consolidatedSources == null || consolidatedSources.language() == null || consolidatedSources.headline() == null || consolidatedSources.sources().isEmpty()) {
            throw new IOException("ConsolidatedSourcesDTO validation failed: missing essential fields.");
        }
        if (curriculumOverview == null || curriculumOverview.language() == null || curriculumOverview.overallLearningPath().isEmpty()) {
            throw new IOException("CurriculumDTO validation failed: missing essential fields.");
        }
        // More comprehensive validation would check each nested DTO
        // For example, ensuring all TopicDTOs have IDs, estimated_hours > 0, etc.
    }

    private LLMGeneratedCurriculum fallbackToStaticMock(String language) {
        System.err.println("Falling back to static mock curriculum for language: " + language);
        return new LLMGeneratedCurriculum(
            new ConsolidatedSourcesDTO(language, "Fallback Learning Hub", Collections.emptyList()),
            new CurriculumDTO(
                language,
                LocalDateTime.now(),
                Collections.<LearningLevelDTO>emptyList(), // Cast for overallLearningPath
                Collections.<String>emptyList(),           // Cast for coreSources
                Collections.<String>emptyList(),           // Cast for supplementalSources
                Collections.<PracticeProjectDTO>emptyList(), // Cast for practiceProjects
                "Fallback explanation",
                "Fallback-Model-v0"
            )
        );
    }

    public record LLMGeneratedCurriculum(
        ConsolidatedSourcesDTO consolidatedSources,
        CurriculumDTO curriculumOverview
    ) {}
}
