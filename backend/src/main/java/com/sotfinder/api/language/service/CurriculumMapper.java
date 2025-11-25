package com.sotfinder.api.language.service;

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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CurriculumMapper {

    // --- Entity to DTO Conversion Helper Methods ---
    public CurriculumDTO convertToDto(CurriculumEntity entity) {
        return new CurriculumDTO(
                entity.getLanguage(),
                entity.getGeneratedAt(),
                entity.getCanonicalSources() != null ? entity.getCanonicalSources().stream().map(this::convertCanonicalSourceToDto).collect(Collectors.toList()) : new ArrayList<>(),
                entity.getOverallLearningPath() != null ? entity.getOverallLearningPath().stream().map(this::convertLevelToDto).collect(Collectors.toList()) : new ArrayList<>(),
                new ArrayList<>(entity.getCoreSources()),
                new ArrayList<>(entity.getSupplementalSources()),
                entity.getPracticeProjects() != null ? entity.getPracticeProjects().stream().map(this::convertPracticeProjectToDto).collect(Collectors.toList()) : new ArrayList<>(),
                entity.getExplanation(),
                entity.getModelVersion()
        );
    }

    public CanonicalSourceDTO convertCanonicalSourceToDto(CanonicalSourceEntity entity) {
        return new CanonicalSourceDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getUrl(),
                entity.getSteward(),
                entity.getType(),
                entity.getConfidence(),
                entity.getShortSummary()
        );
    }

    public LearningLevelDTO convertLevelToDto(LearningLevelEntity entity) {
        return new LearningLevelDTO(
                entity.getLevel(),
                entity.getEstimatedHours(),
                entity.getTopics() != null ? entity.getTopics().stream().map(this::convertTopicToDto).collect(Collectors.toList()) : new ArrayList<>()
        );
    }

    public TopicDTO convertTopicToDto(TopicEntity entity) {
        return new TopicDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getOrder(),
                entity.getEstimatedHours(),
                new ArrayList<>(entity.getPrerequisites()),
                new ArrayList<>(entity.getOutcomes()),
                new ArrayList<>(entity.getExampleExercises()),
                entity.getHelpfulReferences() != null ? entity.getHelpfulReferences().stream().map(this::convertSourceReferenceToDto).collect(Collectors.toList()) : new ArrayList<>(),
                new ArrayList<>(entity.getExplainability()),
                entity.getSubtopics() != null ? entity.getSubtopics().stream().map(this::convertTopicToDto).collect(Collectors.toList()) : new ArrayList<>(),
                entity.getLearningResources() != null ? entity.getLearningResources().stream().map(this::convertLearningResourceToDto).collect(Collectors.toList()) : new ArrayList<>()
        );
    }

    public LearningResourceDTO convertLearningResourceToDto(LearningResourceEntity entity) {
        return new LearningResourceDTO(
                entity.getTitle(),
                entity.getUrl(),
                entity.getType(),
                entity.getAuthorityScore(),
                entity.getShortSummary()
        );
    }

    public SourceReferenceDTO convertSourceReferenceToDto(SourceReferenceEntity entity) {
        return new SourceReferenceDTO(
                entity.getSourceId(),
                entity.getUrl(),
                entity.getSnippet(),
                entity.getShortEvidence()
        );
    }

    public PracticeProjectDTO convertPracticeProjectToDto(PracticeProjectEntity entity) {
        return new PracticeProjectDTO(
                entity.getTitle(),
                entity.getDescription(),
                entity.getDifficulty(),
                entity.getEstimatedHours(),
                new ArrayList<>(entity.getOutcomes())
        );
    }


    // --- DTO to Entity Conversion Helper Methods ---
    public CurriculumEntity convertToEntity(CurriculumDTO dto, String configTopicsHash) {
        CurriculumEntity entity = new CurriculumEntity();
        entity.setLanguage(dto.language());
        entity.setGeneratedAt(dto.generatedAt() != null ? dto.generatedAt() : LocalDateTime.now());
        entity.setExplanation(dto.explanation());
        entity.setModelVersion(dto.modelVersion());
        entity.setConfigTopicsHash(configTopicsHash); // Set the hash

        if (dto.overallLearningPath() != null) {
            dto.overallLearningPath().forEach(levelDto -> entity.addLearningLevel(convertLevelToEntity(levelDto, entity)));
        }
        if (dto.canonicalSources() != null) {
            dto.canonicalSources().forEach(sourceDto -> entity.addCanonicalSource(convertCanonicalSourceToEntity(sourceDto, entity)));
        }
        if (dto.coreSources() != null) {
            entity.setCoreSources(new ArrayList<>(dto.coreSources()));
        }
        if (dto.supplementalSources() != null) {
            entity.setSupplementalSources(new ArrayList<>(dto.supplementalSources()));
        }
        if (dto.practiceProjects() != null) {
            dto.practiceProjects().forEach(projectDto -> entity.addPracticeProject(convertPracticeProjectToEntity(projectDto, entity)));
        }

        return entity;
    }

    public LearningLevelEntity convertLevelToEntity(LearningLevelDTO dto, CurriculumEntity curriculum) {
        LearningLevelEntity entity = new LearningLevelEntity();
        entity.setLevel(dto.level());
        entity.setEstimatedHours(dto.estimatedHours());
        entity.setCurriculum(curriculum);

        if (dto.topics() != null) {
            dto.topics().forEach(topicDto -> entity.addTopic(convertTopicToEntity(topicDto, entity, null)));
        }
        return entity;
    }

    public TopicEntity convertTopicToEntity(TopicDTO dto, LearningLevelEntity learningLevel, TopicEntity parentTopic) {
        TopicEntity entity = new TopicEntity();
        entity.setId(dto.id());
        entity.setTitle(dto.title());
        entity.setDescription(dto.description());
        entity.setOrder(dto.order());
        entity.setEstimatedHours(dto.estimatedHours());
        entity.setPrerequisites(new ArrayList<>(dto.prerequisites()));
        entity.setOutcomes(new ArrayList<>(dto.outcomes()));
        entity.setExampleExercises(new ArrayList<>(dto.exampleExercises()));
        entity.setExplainability(new ArrayList<>(dto.explainability()));
        entity.setLearningLevel(learningLevel);
        entity.setParentTopic(parentTopic);

        if (dto.subtopics() != null) {
            dto.subtopics().forEach(subtopicDto -> entity.addSubtopic(convertTopicToEntity(subtopicDto, learningLevel, entity)));
        }
        if (dto.helpfulReferences() != null) {
            dto.helpfulReferences().forEach(refDto -> entity.addHelpfulReference(convertSourceReferenceToEntity(refDto, entity)));
        }
        if (dto.learningResources() != null) {
            dto.learningResources().forEach(resDto -> entity.addLearningResource(convertLearningResourceToEntity(resDto, entity)));
        }
        return entity;
    }

    public CanonicalSourceEntity convertCanonicalSourceToEntity(CanonicalSourceDTO dto, CurriculumEntity curriculum) {
        CanonicalSourceEntity entity = new CanonicalSourceEntity();
        entity.setId(dto.id());
        entity.setTitle(dto.title());
        entity.setUrl(dto.url());
        entity.setSteward(dto.steward());
        entity.setType(dto.type());
        entity.setConfidence(dto.confidence());
        entity.setShortSummary(dto.shortSummary());
        entity.setCurriculum(curriculum);
        return entity;
    }

    public LearningResourceEntity convertLearningResourceToEntity(LearningResourceDTO dto, TopicEntity topic) {
        LearningResourceEntity entity = new LearningResourceEntity();
        entity.setTitle(dto.title());
        entity.setUrl(dto.url());
        entity.setType(dto.type());
        entity.setAuthorityScore(dto.authorityScore());
        entity.setShortSummary(dto.shortSummary());
        entity.setTopic(topic);
        return entity;
    }

    public SourceReferenceEntity convertSourceReferenceToEntity(SourceReferenceDTO dto, TopicEntity topic) {
        SourceReferenceEntity entity = new SourceReferenceEntity();
        entity.setSourceId(dto.sourceId());
        entity.setUrl(dto.url());
        entity.setSnippet(dto.snippet());
        entity.setShortEvidence(dto.shortEvidence());
        entity.setTopic(topic);
        return entity;
    }

    public PracticeProjectEntity convertPracticeProjectToEntity(PracticeProjectDTO dto, CurriculumEntity curriculum) {
        PracticeProjectEntity entity = new PracticeProjectEntity();
        entity.setTitle(dto.title());
        entity.setDescription(dto.description());
        entity.setDifficulty(dto.difficulty());
        entity.setEstimatedHours(dto.estimatedHours());
        entity.setOutcomes(new ArrayList<>(dto.outcomes()));
        entity.setCurriculum(curriculum);
        return entity;
    }
}
