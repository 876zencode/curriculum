package com.sotfinder.api.language.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sotfinder.api.language.dto.CanonicalSourceDTO;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.service.JsonDataService;
import com.sotfinder.api.service.LLMService;
import com.sotfinder.api.service.OpenAILLMService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LanguageCurriculumService {

    private final JsonDataService jsonDataService;
    private final LLMService llmService;
    private final ConcurrentHashMap<String, CurriculumDTO> curriculumCache = new ConcurrentHashMap<>();

    public LanguageCurriculumService(JsonDataService jsonDataService, OpenAILLMService llmService) {
        this.jsonDataService = jsonDataService;
        this.llmService = llmService;
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
            JsonNode curriculumData = jsonDataService.getCurriculumData(lang);
            if (curriculumData == null) {
                throw new IllegalArgumentException("No curriculum data found for language: " + lang);
            }
            return llmService.generateCurriculum(lang, curriculumData.toString());
        });
    }
}
