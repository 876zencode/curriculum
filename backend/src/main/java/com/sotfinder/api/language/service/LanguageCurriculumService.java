package com.sotfinder.api.language.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sotfinder.api.language.dto.CanonicalSourceDTO;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.dto.LearningLevelDTO;
import com.sotfinder.api.language.dto.LearningResourceDTO;
import com.sotfinder.api.language.dto.TopicDTO;
import com.sotfinder.api.service.JsonDataService;
import com.sotfinder.api.service.LLMService;
import com.sotfinder.api.service.LearningResourceService;
import com.sotfinder.api.service.OpenAILLMService;
import com.sotfinder.api.service.OpenAILLearningResourceService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class LanguageCurriculumService {

    private final JsonDataService jsonDataService;
    private final LLMService llmService;
    private final LearningResourceService learningResourceService;
    private final ObjectMapper objectMapper; // Inject ObjectMapper for parsing JsonNode

    private final ConcurrentHashMap<String, CurriculumDTO> curriculumCache = new ConcurrentHashMap<>();

    public LanguageCurriculumService(JsonDataService jsonDataService, OpenAILLMService llmService, OpenAILLearningResourceService learningResourceService, ObjectMapper objectMapper) {
        this.jsonDataService = jsonDataService;
        this.llmService = llmService;
        this.learningResourceService = learningResourceService;
        this.objectMapper = objectMapper;
    }

    public List<CanonicalSourceDTO> getCanonicalSources(String language) {
        CurriculumDTO curriculum = getOrGenerateCurriculum(language);
        return curriculum.canonicalSources();
    }

    public CurriculumDTO getCurriculum(String language) {
        return getOrGenerateCurriculum(language);
    }

    private CurriculumDTO getOrGenerateCurriculum(String language) {
        return curriculumCache.computeIfAbsent(language.toLowerCase(), lang -> {
            JsonNode fullConfigData = jsonDataService.getCurriculumData(lang);
            if (fullConfigData == null) {
                throw new IllegalArgumentException("No curriculum data found for language: " + lang);
            }

            // Extract trust profiles from the full config data
            JsonNode trustProfilesNode = fullConfigData.has("trustProfiles") ? fullConfigData.get("trustProfiles").get("trustProfiles") : null;
            final JsonNode effectiveTrustProfilesNode; // Declare a new final variable
            if (trustProfilesNode == null) {
                // Handle case where trust profiles are not found, perhaps default to an empty object
                effectiveTrustProfilesNode = objectMapper.createObjectNode();
            } else {
                effectiveTrustProfilesNode = trustProfilesNode;
            }

            // Generate initial CurriculumDTO from the LLM based on the topics part of the config
            CurriculumDTO initialCurriculum = llmService.generateCurriculum(lang, fullConfigData.get("topics").toString());

            // Recursively generate learning resources for each topic and subtopic
            List<LearningLevelDTO> updatedLearningPath = initialCurriculum.overallLearningPath().stream() // Fixed accessor
                    .map(level -> {
                        List<TopicDTO> updatedTopics = level.topics().stream()
                                .map(topic -> processTopicForLearningResources(lang, topic, effectiveTrustProfilesNode))
                                .collect(Collectors.toList());
                        return new LearningLevelDTO(level.level(), level.estimatedHours(), updatedTopics); // Fixed accessor
                    })
                    .collect(Collectors.toList());

            // Return a new CurriculumDTO with updated learning path
            return new CurriculumDTO(
                    initialCurriculum.language(),
                    initialCurriculum.generatedAt(),
                    initialCurriculum.canonicalSources(),
                    updatedLearningPath, // Use the updated list
                    initialCurriculum.coreSources(),
                    initialCurriculum.supplementalSources(),
                    initialCurriculum.practiceProjects(),
                    initialCurriculum.explanation(),
                    initialCurriculum.modelVersion()
            );
        });
    }

    private TopicDTO processTopicForLearningResources(String language, TopicDTO topic, JsonNode trustProfilesNode) {
        List<LearningResourceDTO> generatedResources = learningResourceService.generateLearningResources(language, topic.title(), trustProfilesNode);

        // Recursively process subtopics
        List<TopicDTO> updatedSubtopics = topic.subtopics().stream()
                .map(subtopic -> processTopicForLearningResources(language, subtopic, trustProfilesNode))
                .collect(Collectors.toList());

        // Return a new TopicDTO with learning resources and updated subtopics
        return new TopicDTO(
                topic.id(),
                topic.title(),
                topic.description(),
                topic.order(),
                topic.estimatedHours(), // Fixed accessor
                topic.prerequisites(),
                topic.outcomes(),
                topic.exampleExercises(),
                topic.helpfulReferences(), // Fixed accessor
                topic.explainability(),
                updatedSubtopics,
                generatedResources // Add the generated learning resources here
        );
    }
}
