package com.sotfinder.api.language.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "curriculums")
public class CurriculumEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @OneToMany(mappedBy = "curriculum", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LearningLevelEntity> overallLearningPath = new ArrayList<>();

    @OneToMany(mappedBy = "curriculum", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CanonicalSourceEntity> canonicalSources = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "curriculum_core_sources", joinColumns = @JoinColumn(name = "curriculum_id"))
    @Column(name = "core_source_url")
    private List<String> coreSources = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "curriculum_supplemental_sources", joinColumns = @JoinColumn(name = "curriculum_id"))
    @Column(name = "supplemental_source_url")
    private List<String> supplementalSources = new ArrayList<>();

    @OneToMany(mappedBy = "curriculum", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PracticeProjectEntity> practiceProjects = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "config_topics_hash")
    private String configTopicsHash;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public List<LearningLevelEntity> getOverallLearningPath() {
        return overallLearningPath;
    }

    public void setOverallLearningPath(List<LearningLevelEntity> overallLearningPath) {
        this.overallLearningPath = overallLearningPath;
    }

    public List<CanonicalSourceEntity> getCanonicalSources() {
        return canonicalSources;
    }

    public void setCanonicalSources(List<CanonicalSourceEntity> canonicalSources) {
        this.canonicalSources = canonicalSources;
    }

    public List<String> getCoreSources() {
        return coreSources;
    }

    public void setCoreSources(List<String> coreSources) {
        this.coreSources = coreSources;
    }

    public List<String> getSupplementalSources() {
        return supplementalSources;
    }

    public void setSupplementalSources(List<String> supplementalSources) {
        this.supplementalSources = supplementalSources;
    }

    public List<PracticeProjectEntity> getPracticeProjects() {
        return practiceProjects;
    }

    public void setPracticeProjects(List<PracticeProjectEntity> practiceProjects) {
        this.practiceProjects = practiceProjects;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    // Helper methods to manage relationships
    public void addLearningLevel(LearningLevelEntity level) {
        this.overallLearningPath.add(level);
        level.setCurriculum(this);
    }

    public void removeLearningLevel(LearningLevelEntity level) {
        this.overallLearningPath.remove(level);
        level.setCurriculum(null);
    }

    public void addCanonicalSource(CanonicalSourceEntity source) {
        this.canonicalSources.add(source);
        source.setCurriculum(this);
    }

    public void removeCanonicalSource(CanonicalSourceEntity source) {
        this.canonicalSources.remove(source);
        source.setCurriculum(null);
    }

    public void addPracticeProject(PracticeProjectEntity project) {
        this.practiceProjects.add(project);
        project.setCurriculum(this);
    }

    public void removePracticeProject(PracticeProjectEntity project) {
        this.practiceProjects.remove(project);
        project.setCurriculum(null);
    }

    public String getConfigTopicsHash() {
        return configTopicsHash;
    }

    public void setConfigTopicsHash(String configTopicsHash) {
        this.configTopicsHash = configTopicsHash;
    }
}
