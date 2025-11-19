package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sotfinder.api.dto.RankedResourceDTO;
import com.sotfinder.api.dto.SearchResponseDTO;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Arrays; // For mock data

@Service
public class LLMCurriculumEvaluationService {

  private final ObjectMapper objectMapper;
  // private final ChatClient chatClient; // Uncomment and inject for actual LLM
  // integration

  // Corrected and cleaner mock JSON responses using text blocks (Java 15+)
  private static final String MOCK_JAVA_RESPONSE = """
      [
        {
          "title": "Oracle Java Tutorials",
          "url": "https://docs.oracle.com/javase/tutorial/",
          "is_official": true,
          "confidence": 0.95,
          "reasoning": "Official and comprehensive, excellent for foundational Java learning directly from Oracle.",
          "metadata": {
            "type": "official-docs",
            "spec_version": "Varies",
            "notes": "Canonical learning path for Java SE"
          },
          "resource_type": "Official Documentation",
          "short_description": "The official set of tutorials from Oracle covering core Java concepts, GUI programming with Swing, and more advanced topics. It provides a structured learning path for beginners and intermediate developers.",
          "learning_level_tags": [
            { "level": "Beginner", "description": "Covers Java fundamentals and syntax." },
            { "level": "Intermediate", "description": "Includes advanced language features and APIs." }
          ],
          "skill_outcomes": ["Understand OOP concepts", "Write basic Java applications", "Develop Swing GUIs", "Work with Java Collections"],
          "estimated_difficulty": "Beginner to Intermediate",
          "pedagogical_quality_score": 0.92,
          "curriculum_extract": [
            {
              "name": "Java Basics",
              "summary": "Covers variables, operators, control flow, and basic data types.",
              "order": 1,
              "category": "Fundamentals",
              "subtopics": [
                { "name": "Variables and Data Types", "summary": "Declaration and usage of primitive and reference types.", "order": 1, "category": "Fundamentals", "subtopics": [] },
                { "name": "Operators", "summary": "Arithmetic, relational, logical, and bitwise operators.", "order": 2, "category": "Fundamentals", "subtopics": [] }
              ]
            },
            {
              "name": "Object-Oriented Programming",
              "summary": "Explains classes, objects, inheritance, polymorphism, and encapsulation.",
              "order": 2,
              "category": "Fundamentals",
              "subtopics": [
                { "name": "Classes and Objects", "summary": "Defining classes, creating objects, constructors.", "order": 1, "category": "Fundamentals", "subtopics": [] },
                { "name": "Inheritance", "summary": "Extending classes and method overriding.", "order": 2, "category": "Fundamentals", "subtopics": [] }
              ]
            },
             {
              "name": "Generics",
              "summary": "Introduces type-safe collections and classes.",
              "order": 3,
              "category": "Advanced Concepts",
              "subtopics": []
            }
          ]
        },
        {
          "title": "Baeldung Java Tutorials",
          "url": "https://www.baeldung.com/java-basics",
          "is_official": false,
          "confidence": 0.88,
          "reasoning": "Highly respected community resource known for practical, clear explanations and extensive examples.",
          "metadata": {
            "type": "community-tutorial",
            "notes": "Excellent for practical examples and deep dives"
          },
          "resource_type": "Community Tutorial",
          "short_description": "A very popular and well-maintained blog offering a vast array of Java tutorials, focusing on practical application, Spring Framework, and enterprise Java development. Ideal for intermediate to advanced learners.",
          "learning_level_tags": [
            { "level": "Intermediate", "description": "Focuses on deeper concepts and framework usage." },
            { "level": "Advanced", "description": "Covers complex topics and best practices." }
          ],
          "skill_outcomes": ["Implement Spring Boot applications", "Understand Maven/Gradle", "Work with Hibernate/JPA", "Design REST APIs"],
          "estimated_difficulty": "Intermediate to Advanced",
          "pedagogical_quality_score": 0.90,
          "curriculum_extract": [
            {
              "name": "Spring Framework Introduction",
              "summary": "Core concepts of Spring like IoC and DI.",
              "order": 1,
              "category": "Ecosystem",
              "subtopics": []
            },
            {
              "name": "REST APIs with Spring Boot",
              "summary": "Building robust RESTful services.",
              "order": 2,
              "category": "Best Practices",
              "subtopics": []
            }
          ]
        }
      ]
      """;

  private static final String MOCK_REACT_RESPONSE = """
      [
        {
          "title": "React Official Documentation",
          "url": "https://react.dev/learn",
          "is_official": true,
          "confidence": 0.99,
          "reasoning": "The primary and most up-to-date source for learning React directly from the framework's creators.",
          "metadata": {
            "type": "official-docs",
            "notes": "Modern React learning path"
          },
          "resource_type": "Official Documentation",
          "short_description": "The completely re-imagined official documentation for React, focusing on modern React best practices, Hooks, and functional components. It provides interactive examples and a clear learning path.",
          "learning_level_tags": [
            { "level": "Beginner", "description": "Introduces core React concepts and component-based UI." },
            { "level": "Intermediate", "description": "Covers Hooks, state management, and performance." }
          ],
          "skill_outcomes": ["Build reactive UIs", "Manage component state with Hooks", "Understand component lifecycle", "Optimize React applications"],
          "estimated_difficulty": "Beginner to Intermediate",
          "pedagogical_quality_score": 0.98,
          "curriculum_extract": [
            {
              "name": "Describing the UI",
              "summary": "How to declare components and pass props.",
              "order": 1,
              "category": "Fundamentals",
              "subtopics": [
                { "name": "Your First Component", "summary": "Basic functional component structure.", "order": 1, "category": "Fundamentals", "subtopics": [] },
                { "name": "Passing Props to a Component", "summary": "Data flow from parent to child components.", "order": 2, "category": "Fundamentals", "subtopics": [] }
              ]
            },
            {
              "name": "Adding Interactivity",
              "summary": "Handling events, state, and rendering lists.",
              "order": 2,
              "category": "Fundamentals",
              "subtopics": [
                { "name": "State: A Component's Memory", "summary": "Using useState to manage dynamic data.", "order": 1, "category": "Fundamentals", "subtopics": [] },
                { "name": "Event Handlers", "summary": "Responding to user interactions.", "order": 2, "category": "Fundamentals", "subtopics": [] }
              ]
            },
             {
              "name": "Managing State",
              "summary": "Advanced state patterns and context.",
              "order": 3,
              "category": "Advanced Concepts",
              "subtopics": []
            }
          ]
        },
        {
          "title": "FreeCodeCamp React Tutorial",
          "url": "https://www.freecodecamp.org/news/react-tutorial-for-beginners-a-complete-introduction/",
          "is_official": false,
          "confidence": 0.85,
          "reasoning": "A very popular and beginner-friendly tutorial that covers React basics effectively with a hands-on approach.",
          "metadata": {
            "type": "community-tutorial",
            "notes": "Excellent for beginners"
          },
          "resource_type": "Community Tutorial",
          "short_description": "A comprehensive FreeCodeCamp tutorial introducing React from scratch, covering JSX, components, props, state, and basic routing. It's project-based, guiding learners through building a simple application.",
          "learning_level_tags": [
            { "level": "Beginner", "description": "Designed for absolute beginners to React." }
          ],
          "skill_outcomes": ["Set up a React project", "Create functional components", "Use props and state", "Basic client-side routing"],
          "estimated_difficulty": "Beginner",
          "pedagogical_quality_score": 0.89,
          "curriculum_extract": [
            {
              "name": "Introduction to React",
              "summary": "What is React, its benefits, and setting up the development environment.",
              "order": 1,
              "category": "Fundamentals",
              "subtopics": []
            },
            {
              "name": "Components and JSX",
              "summary": "Building blocks of React and writing UI with JSX.",
              "order": 2,
              "category": "Fundamentals",
              "subtopics": []
            }
          ]
        }
      ]
      """;

  public LLMCurriculumEvaluationService(ObjectMapper objectMapper /* , ChatClient chatClient */) {
    this.objectMapper = objectMapper;
    // this.chatClient = chatClient;
  }

  public SearchResponseDTO evaluateCurriculum(String query) {
    String sanitizedQuery = query.toLowerCase().trim();

    // 1. Simulate fetching top documentation/tutorial URLs (in a real app, this
    // would involve a web search/crawl)
    List<String> simulatedUrls = simulateResourceFetching(sanitizedQuery);

    // 2. Build a high-quality LLM prompt for evaluation and curriculum extraction
    String llmPrompt = buildLlmEvaluationPrompt(sanitizedQuery, simulatedUrls);
    System.out.println("LLM Prompt:\n" + llmPrompt);

    // 3. Call LLM API - Placeholder for actual LLM integration
    // For now, we return a detailed mock response based on the query.
    String llmApiResponse = callLlmApi(llmPrompt, sanitizedQuery);
    System.out.println("LLM Raw Response:\n" + llmApiResponse);

    // 4. Validate and parse JSON response
    try {
      List<RankedResourceDTO> evaluatedResources = parseLlmResponse(llmApiResponse);
      return new SearchResponseDTO(query, evaluatedResources);
    } catch (IOException e) {
      System.err.println("Error parsing LLM response: " + e.getMessage());
      // In a real application, you'd want more robust error handling
      return new SearchResponseDTO(query, Collections.emptyList());
    }
  }

  private List<String> simulateResourceFetching(String query) {
    // In a real application, this would involve calling a search engine API or a
    // web crawler
    // For this prototype, we'll return some static URLs based on the query
    if (query.contains("java")) {
      return Arrays.asList(
          "https://docs.oracle.com/javase/tutorial/",
          "https://www.baeldung.com/java-basics",
          "https://www.spring.io/guides");
    } else if (query.contains("react")) {
      return Arrays.asList(
          "https://react.dev/learn",
          "https://beta.reactjs.org/learn", // Older, but still useful
          "https://www.freecodecamp.org/news/react-tutorial-for-beginners-a-complete-introduction/");
    }
    return Collections.emptyList();
  }

  private String buildLlmEvaluationPrompt(String query, List<String> urlsToEvaluate) {
    StringBuilder promptBuilder = new StringBuilder();
    promptBuilder.append(
        """
                        You are an authoritative curriculum engine for software development.
                        Given a programming language or framework (e.g., 'java', 'react') and a list of resource URLs,
                        your task is to evaluate each resource comprehensively based on the following rubric.
                        For each resource, you must:
                        1. Determine its \"Official Authority\" (e.g., Oracle, MDN, Spring, ECMA).
                        2. Assess its \"Pedagogical Quality\" (how well it teaches, clarity, structure).
                        3. Evaluate \"Practical Developer Usefulness\" (relevance to real-world development).
                        4. Infer \"Senior-Engineer Approval\" (would a senior dev recommend it?).
                        5. Estimate \"Update Freshness\" (is the content up-to-date?).
                        6. Judge \"Real-world Learning Relevance\" (is it applicable to current industry needs?).
                        7. Assess \"Idiomatic Teaching Quality\" (does it teach best practices?).
                        8. Evaluate \"Ecosystem Completeness\" (how much of the ecosystem does it cover?).
                        9. Identify \"Presence of Exercises\" (does it offer practice?).
                        10. Determine \"Beginner \u2192 Advanced Learning Path Value\" (does it guide a learner effectively?).

                        Additionally, for each resource, you must:
                        - Provide a concise \"short_description\" (2-3 sentences).
                        - Assign \"learning_level_tags\" (Beginner, Intermediate, Advanced) with short descriptions.
                        - List \"skill_outcomes\" (e.g., \"build REST APIs\", \"understand OOP\").
                        - Assign \"estimated_difficulty\" (Beginner, Intermediate, Advanced).
                        - Give a \"pedagogical_quality_score\" (0-1).
                        - Extract the top topics, sections, and subtopics as a \"curriculum_extract\". For each topic:
                            - Summarize it.
                            - Assign a recommended learning \"order\".
                            - Categorize it (Fundamentals, Tooling, Ecosystem, Best Practices, Advanced Concepts).
                            - Identify nested \"subtopics\" recursively.

                        Return the response as a JSON array of evaluated resources. Each resource should adhere strictly to the `RankedResourceDTO` structure.

            The query is: '%s'
            Resources to evaluate:
                        """
            .formatted(query));

    for (int i = 0; i < urlsToEvaluate.size(); i++) {
      promptBuilder.append(String.format("%d. %s\n", i + 1, urlsToEvaluate.get(i)));
    }
    promptBuilder.append("\nReturn JSON array only.\n");

    return promptBuilder.toString();
  }

  // THIS IS A MOCK IMPLEMENTATION. REPLACE WITH ACTUAL LLM API CALL.
  private String callLlmApi(String promptContent, String query) {
    // In a real scenario, this would involve making an HTTP request to the Gemini
    // API
    // or another LLM provider with the 'promptContent'.
    // For demonstration, we return a hardcoded detailed mock response.
    System.out.println("--- MOCKING LLM API CALL (Curriculum Evaluation) ---");

    if (query.contains("java")) {
      return MOCK_JAVA_RESPONSE;
    } else if (query.contains("react")) {
      return MOCK_REACT_RESPONSE;
    }
    return "[]";
  }

  private List<RankedResourceDTO> parseLlmResponse(String llmApiResponse) throws IOException {
    return objectMapper.readValue(llmApiResponse,
        objectMapper.getTypeFactory().constructCollectionType(List.class, RankedResourceDTO.class));
  }

  // Instructions for integrating the actual Gemini API are similar to before, but
  // now the prompt and
  // expected response JSON structure are more complex. You'd feed the 'llmPrompt'
  // to your chosen
  // Gemini API client and expect a JSON string back that conforms to a
  // List<RankedResourceDTO>.
  // Ensure your API client handles large responses if the curriculum extract is
  // very detailed.
  // The ChatClient (spring-ai) approach would remain largely the same, just
  // feeding the
  // more complex prompt and parsing the resulting JSON string.
}