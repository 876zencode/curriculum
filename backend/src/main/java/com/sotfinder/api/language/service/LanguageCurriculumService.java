package com.sotfinder.api.language.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sotfinder.api.exception.DataNotFoundException; // Added
import com.sotfinder.api.language.dto.CanonicalSourceDTO;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.dto.LearningLevelDTO;
import com.sotfinder.api.language.dto.LearningResourceDTO;
import com.sotfinder.api.language.dto.PracticeProjectDTO;
import com.sotfinder.api.language.dto.SourceReferenceDTO;
import com.sotfinder.api.language.dto.TopicDTO;
import com.sotfinder.api.language.entity.CanonicalSourceEntity;
import com.sotfinder.api.language.entity.CurriculumEntity;
import com.sotfinder.api.language.entity.LearningLevelEntity;
import com.sotfinder.api.language.entity.LearningResourceEntity;
import com.sotfinder.api.language.entity.PracticeProjectEntity;
import com.sotfinder.api.language.entity.SourceReferenceEntity;
import com.sotfinder.api.language.entity.TopicEntity;
import com.sotfinder.api.language.repository.CurriculumRepository;
import com.sotfinder.api.service.JsonDataService;
import com.sotfinder.api.service.LLMService;
import com.sotfinder.api.service.LearningResourceService;
import com.sotfinder.api.service.OpenAILLMService;
import com.sotfinder.api.service.OpenAILLearningResourceService;
import com.sotfinder.api.language.service.CurriculumMapper; // Added
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class LanguageCurriculumService {

    private final JsonDataService jsonDataService;
    private final LLMService llmService;
    private final LearningResourceService learningResourceService;
    private final ObjectMapper objectMapper;
    private final CurriculumRepository curriculumRepository; // Injected repository
    private final CurriculumMapper curriculumMapper; // Injected mapper

    // Changed to cache DTOs, not entities
    private final ConcurrentHashMap<String, CurriculumDTO> curriculumCache = new ConcurrentHashMap<>();

    public LanguageCurriculumService(
            JsonDataService jsonDataService,
            OpenAILLMService llmService,
            OpenAILLearningResourceService learningResourceService,
            ObjectMapper objectMapper,
            CurriculumRepository curriculumRepository, // Injected
            CurriculumMapper curriculumMapper // Injected
    ) {
        this.jsonDataService = jsonDataService;
        this.llmService = llmService;
        this.learningResourceService = learningResourceService;
        this.objectMapper = objectMapper;
        this.curriculumRepository = curriculumRepository;
        this.curriculumMapper = curriculumMapper;
    }
    public List<CanonicalSourceDTO> getCanonicalSources(String language) {
        CurriculumDTO curriculum = getCurriculum(language); // Changed to use getCurriculum
        return curriculum.canonicalSources();
    }

    public CurriculumDTO getCurriculum(String language) {
        String langKey = language.toLowerCase();

        // 1. Check in-memory cache first
        CurriculumDTO cachedCurriculum = curriculumCache.get(langKey);
        if (cachedCurriculum != null) {
            return cachedCurriculum;
        }

        // 2. If not in cache, try to find in database
        Optional<CurriculumEntity> existingCurriculumEntity = curriculumRepository.findByLanguage(langKey);
        if (existingCurriculumEntity.isPresent()) {
            CurriculumDTO dto = curriculumMapper.convertToDto(existingCurriculumEntity.get()); // Use mapper
            curriculumCache.put(langKey, dto); // Populate cache from DB
            return dto;
        }

        // 3. If not in DB or cache, data is not pre-loaded. Throw exception.
        throw new DataNotFoundException("Curriculum data for language " + language + " not found. Please ensure it has been pre-loaded by the background job.");
    }

    @Transactional // Ensure all operations are part of a single transaction
    public CurriculumDTO generateCurriculumWithLLM(String language, JsonNode fullConfigData) {
        String langKey = language.toLowerCase();

        JsonNode trustProfilesNode = fullConfigData.has("trustProfiles") ? fullConfigData.get("trustProfiles").get("trustProfiles") : null;
        final JsonNode effectiveTrustProfilesNode;
        if (trustProfilesNode == null) {
            effectiveTrustProfilesNode = objectMapper.createObjectNode();
        } else {
            effectiveTrustProfilesNode = trustProfilesNode;
        }

        CurriculumDTO initialCurriculum = llmService.generateCurriculum(langKey, fullConfigData.get("topics").toString());

        // Recursively generate learning resources for each topic and subtopic
        List<LearningLevelDTO> updatedLearningPath = initialCurriculum.overallLearningPath().stream()
                .map(level -> {
                    List<TopicDTO> updatedTopics = level.topics().stream()
                            .map(topic -> processTopicForLearningResources(langKey, topic, effectiveTrustProfilesNode))
                            .collect(Collectors.toList());
                    return new LearningLevelDTO(level.level(), level.estimatedHours(), updatedTopics);
                })
                .collect(Collectors.toList());

        // Final Curriculum DTO after LLM generation and resource enrichment
        CurriculumDTO finalCurriculumDTO = new CurriculumDTO(
                initialCurriculum.language(),
                initialCurriculum.generatedAt(),
                initialCurriculum.canonicalSources(),
                updatedLearningPath,
                initialCurriculum.coreSources(),
                initialCurriculum.supplementalSources(),
                initialCurriculum.practiceProjects(),
                initialCurriculum.explanation(),
                initialCurriculum.modelVersion()
        );

        // Populate in-memory cache
        curriculumCache.put(langKey, finalCurriculumDTO);
        return finalCurriculumDTO;
    }

    private TopicDTO processTopicForLearningResources(String language, TopicDTO topic, JsonNode trustProfilesNode) {
        List<LearningResourceDTO> generatedResources = learningResourceService.generateLearningResources(language, topic.title(), trustProfilesNode);

        List<TopicDTO> updatedSubtopics = topic.subtopics().stream()
                .map(subtopic -> processTopicForLearningResources(language, subtopic, trustProfilesNode))
                .collect(Collectors.toList());

        return new TopicDTO(
                topic.id(),
                topic.title(),
                topic.description(),
                topic.order(),
                topic.estimatedHours(),
                topic.prerequisites(),
                topic.outcomes(),
                topic.exampleExercises(),
                topic.helpfulReferences(),
                topic.explainability(),
                updatedSubtopics,
                generatedResources
        );
    }

}
