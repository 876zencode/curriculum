package com.sotfinder.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sotfinder.api.language.dto.LearningResourceDTO;
import com.sotfinder.api.language.dto.TrustProfileDTO;

import java.util.List;
import java.util.Map;

public interface LearningResourceService {
    List<LearningResourceDTO> generateLearningResources(String language, String subtopicTitle, JsonNode trustProfileData);
}
