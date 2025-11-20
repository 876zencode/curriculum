package com.sotfinder.api.language.service;

import com.sotfinder.api.language.dto.CanonicalSourceDTO;
import com.sotfinder.api.language.dto.ConsolidatedSourcesDTO;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.dto.SourceBreakdownDTO;
import com.sotfinder.api.language.dto.TopicDTO;
import com.sotfinder.api.language.service.LLMCurriculumGenerationService.LLMGeneratedCurriculum;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class LanguageCurriculumService {

    private final SourceMergerService sourceMergerService;
    private final LLMCurriculumGenerationService llmCurriculumGenerationService;

    // In-memory cache for generated curricula and sources
    private final Map<String, ConsolidatedSourcesDTO> consolidatedSourcesCache = new ConcurrentHashMap<>();
    private final Map<String, CurriculumDTO> curriculumCache = new ConcurrentHashMap<>();

    public LanguageCurriculumService(SourceMergerService sourceMergerService,
                                     LLMCurriculumGenerationService llmCurriculumGenerationService) {
        this.sourceMergerService = sourceMergerService;
        this.llmCurriculumGenerationService = llmCurriculumGenerationService;
    }

    /**
     * Retrieves or generates the consolidated sources for a given language.
     */
    public ConsolidatedSourcesDTO getConsolidatedSources(String language) {
        return consolidatedSourcesCache.computeIfAbsent(language.toLowerCase(), lang -> {
            List<CanonicalSourceDTO> mergedSources = sourceMergerService.getMergedAndDeduplicatedSources(lang);
            LLMGeneratedCurriculum generated = llmCurriculumGenerationService.generateCurriculum(lang, mergedSources);
            curriculumCache.put(lang, generated.curriculumOverview()); // Cache curriculum as well
            return generated.consolidatedSources();
        });
    }

    /**
     * Retrieves or generates the curriculum overview for a given language.
     */
    public CurriculumDTO getCurriculum(String language) {
        // Ensure sources are consolidated first, which also populates curriculumCache
        getConsolidatedSources(language);
        return curriculumCache.get(language.toLowerCase());
    }

    /**
     * Forces re-evaluation and regeneration of curriculum for a given language.
     * @param language The programming language or framework slug.
     * @return The newly generated ConsolidatedSourcesDTO.
     */
    public ConsolidatedSourcesDTO refreshCurriculum(String language) {
        String lang = language.toLowerCase();
        // Clear cache for this language
        consolidatedSourcesCache.remove(lang);
        curriculumCache.remove(lang);
        // Regenerate and cache
        return getConsolidatedSources(lang);
    }

    /**
     * Extracts and returns the SourceBreakdownDTO for a specific source within a language's curriculum.
     * This method assumes the curriculum for the language has already been generated and cached.
     *
     * @param language The programming language slug.
     * @param sourceId The ID of the CanonicalSourceDTO for which to get the breakdown.
     * @return SourceBreakdownDTO containing topics extracted for that source.
     */
    public SourceBreakdownDTO getSourceBreakdown(String language, String sourceId) {
        CurriculumDTO curriculum = getCurriculum(language); // Ensure curriculum is generated
        if (curriculum == null) {
            return null; // Or throw an exception
        }

        // In a real LLM-powered system, this breakdown might be generated on-demand by a separate LLM call
        // or pre-extracted and stored. For this mock, we'll simulate extracting it from the generated data.
        // Find the target source from the consolidated sources based on sourceId
        CanonicalSourceDTO targetSource = consolidatedSourcesCache.get(language.toLowerCase()).sources().stream()
            .filter(source -> source.id().equals(sourceId))
            .findFirst()
            .orElse(null);


        if (targetSource != null) {
            // Simulate extracted topics. For a real implementation, the LLM would provide this per source.
            // For now, we'll create a basic mock by filtering and adapting general topics.
            List<TopicDTO> extractedTopics = curriculum.overallLearningPath().stream()
                .flatMap(level -> level.topics().stream())
                .filter(topic -> topic.helpfulReferences().stream()
                    .anyMatch(ref -> ref.sourceId().equals(sourceId)))
                .map(topic -> new TopicDTO(
                    topic.id(),
                    topic.title(),
                    topic.description(),
                    topic.order(),
                    topic.estimatedHours(),
                    Collections.emptyList(), // Prerequisites typically not re-listed in breakdown view
                    topic.outcomes(),
                    topic.exampleExercises(),
                    topic.helpfulReferences().stream()
                        .filter(ref -> ref.sourceId().equals(sourceId))
                        .collect(Collectors.toList()),
                    List.of("Derived from overall curriculum and references to " + targetSource.title()), // Simplified explainability
                    topic.subtopics() // Include subtopics
                ))
                .collect(Collectors.toList());

            return new SourceBreakdownDTO(
                sourceId,
                targetSource.title(),
                targetSource.url(),
                "AI-generated summary of " + targetSource.title() + "'s contribution to " + language + " curriculum.",
                extractedTopics,
                Collections.emptyList() // References within source breakdown (not helpful references from topic)
            );
        }

        return null; // Source breakdown not found
    }
}
