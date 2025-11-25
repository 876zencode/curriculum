package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sotfinder.api.language.dto.CurriculumDTO;
import com.sotfinder.api.language.entity.CurriculumEntity;
import com.sotfinder.api.language.repository.CurriculumRepository;
import com.sotfinder.api.language.service.CurriculumMapper;
import com.sotfinder.api.language.service.LanguageCurriculumService;

import jakarta.annotation.PostConstruct;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Set;
import java.util.Optional;

@Service
public class CurriculumDataLoaderService {

    private final JsonDataService jsonDataService;
    private final LanguageCurriculumService languageCurriculumService;
    private final CurriculumRepository curriculumRepository;
    private final CurriculumMapper curriculumMapper; // Injected mapper
    private final ObjectMapper objectMapper; // Injected ObjectMapper

    public CurriculumDataLoaderService(
            JsonDataService jsonDataService,
            LanguageCurriculumService languageCurriculumService,
            CurriculumRepository curriculumRepository,
            CurriculumMapper curriculumMapper,
            ObjectMapper objectMapper) { // Inject ObjectMapper
        this.jsonDataService = jsonDataService;
        this.languageCurriculumService = languageCurriculumService;
        this.curriculumRepository = curriculumRepository;
        this.curriculumMapper = curriculumMapper;
        this.objectMapper = objectMapper; // Initialize ObjectMapper
        System.out.println("CurriculumDataLoaderService: Instance created."); // Added logging
    }

    @PostConstruct // Run once on application startup

    @Scheduled(cron = "0 0 3 * * ?") // Runs every day at 3 AM for periodic updates

    @Transactional

    public void loadAndPersistCurriculumData() {

        System.out.println("CurriculumDataLoaderService: loadAndPersistCurriculumData method invoked."); // Added logging

    

    
        Set<String> languages = jsonDataService.getLanguages();
        if (languages.isEmpty()) {
            System.err.println("No languages found from JsonDataService to load curriculum data.");
            return;
        }

        for (String language : languages) {
            System.out.println("Processing curriculum for language: " + language);
            try {
                JsonNode fullConfigData = jsonDataService.getCurriculumData(language);
                if (fullConfigData == null || !fullConfigData.has("topics")) {
                    System.err.println("No valid topics config found for language: " + language + ", skipping.");
                    continue;
                }
                // Generate a canonical JSON string for consistent hashing
                String currentConfigTopicsJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(fullConfigData.get("topics"));
                String currentConfigTopicsHash = calculateSHA256Hash(currentConfigTopicsJson); // calculateSHA256Hash will also need to be added

                Optional<CurriculumEntity> existingCurriculum = curriculumRepository.findByLanguage(language);

                if (existingCurriculum.isEmpty() || !currentConfigTopicsHash.equals(existingCurriculum.get().getConfigTopicsHash())) {
                    System.out.println("Curriculum for " + language + " needs to be generated/updated.");

                    // Generate curriculum using LLM explicitly
                    CurriculumDTO curriculumDTO = languageCurriculumService.generateCurriculumWithLLM(language, fullConfigData);

                    // Convert DTO to Entity structure using CurriculumMapper
                    CurriculumEntity curriculumEntity = curriculumMapper.convertToEntity(curriculumDTO, currentConfigTopicsHash);
                    
                    existingCurriculum.ifPresent(entity -> curriculumEntity.setId(entity.getId())); // Retain ID if updating

                    curriculumRepository.save(curriculumEntity);
                    System.out.println("Successfully generated and persisted curriculum for language: " + language);
                } else {
                    System.out.println("Curriculum for " + language + " is up to date, skipping LLM generation.");
                }

            } catch (Exception e) {
                System.err.println("Error processing curriculum for language " + language + ": " + e.getMessage());
                e.printStackTrace();
            }
        }    }

    private String calculateSHA256Hash(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes());
            return HexFormat.of().formatHex(hash); // Java 17+
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

}
