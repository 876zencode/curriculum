package com.sotfinder.api.service;

import com.sotfinder.api.language.dto.CurriculumDTO;

public interface LLMService {
    CurriculumDTO generateCurriculum(String language, String curriculumData);
}
