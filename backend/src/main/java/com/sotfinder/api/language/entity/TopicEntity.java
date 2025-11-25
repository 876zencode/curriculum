package com.sotfinder.api.language.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "topics")
public class TopicEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pk_id; // Primary key for the entity

    @Column(name = "topic_id", unique = true) // Business ID, if it needs to be unique
    private String id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "topic_order")
    private int order;

    @Column(name = "estimated_hours")
    private int estimatedHours;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "topic_prerequisites", joinColumns = @JoinColumn(name = "topic_pk_id"))
    @Column(name = "prerequisite_id")
    private List<String> prerequisites = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "topic_outcomes", joinColumns = @JoinColumn(name = "topic_pk_id"))
    @Column(name = "outcome_description")
    private List<String> outcomes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "topic_example_exercises", joinColumns = @JoinColumn(name = "topic_pk_id"))
    @Column(name = "exercise_description")
    private List<String> exampleExercises = new ArrayList<>();

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SourceReferenceEntity> helpfulReferences = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "topic_explainability", joinColumns = @JoinColumn(name = "topic_pk_id"))
    @Column(name = "explainability_source")
    private List<String> explainability = new ArrayList<>();

    @OneToMany(mappedBy = "parentTopic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TopicEntity> subtopics = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_topic_pk_id")
    private TopicEntity parentTopic;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LearningResourceEntity> learningResources = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_level_id")
    private LearningLevelEntity learningLevel;

    // Getters and Setters
    public Long getPk_id() {
        return pk_id;
    }

    public void setPk_id(Long pk_id) {
        this.pk_id = pk_id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public int getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(int estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public List<String> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public List<String> getOutcomes() {
        return outcomes;
    }

    public void setOutcomes(List<String> outcomes) {
        this.outcomes = outcomes;
    }

    public List<String> getExampleExercises() {
        return exampleExercises;
    }

    public void setExampleExercises(List<String> exampleExercises) {
        this.exampleExercises = exampleExercises;
    }

    public List<SourceReferenceEntity> getHelpfulReferences() {
        return helpfulReferences;
    }

    public void setHelpfulReferences(List<SourceReferenceEntity> helpfulReferences) {
        this.helpfulReferences = helpfulReferences;
    }

    public List<String> getExplainability() {
        return explainability;
    }

    public void setExplainability(List<String> explainability) {
        this.explainability = explainability;
    }

    public List<TopicEntity> getSubtopics() {
        return subtopics;
    }

    public void setSubtopics(List<TopicEntity> subtopics) {
        this.subtopics = subtopics;
    }

    public TopicEntity getParentTopic() {
        return parentTopic;
    }

    public void setParentTopic(TopicEntity parentTopic) {
        this.parentTopic = parentTopic;
    }

    public List<LearningResourceEntity> getLearningResources() {
        return learningResources;
    }

    public void setLearningResources(List<LearningResourceEntity> learningResources) {
        this.learningResources = learningResources;
    }

    public LearningLevelEntity getLearningLevel() {
        return learningLevel;
    }

    public void setLearningLevel(LearningLevelEntity learningLevel) {
        this.learningLevel = learningLevel;
    }

    // Helper methods for relationships
    public void addHelpfulReference(SourceReferenceEntity reference) {
        this.helpfulReferences.add(reference);
        reference.setTopic(this);
    }

    public void removeHelpfulReference(SourceReferenceEntity reference) {
        this.helpfulReferences.remove(reference);
        reference.setTopic(null);
    }

    public void addLearningResource(LearningResourceEntity resource) {
        this.learningResources.add(resource);
        resource.setTopic(this);
    }

    public void removeLearningResource(LearningResourceEntity resource) {
        this.learningResources.remove(resource);
        resource.setTopic(null);
    }

    public void addSubtopic(TopicEntity subtopic) {
        this.subtopics.add(subtopic);
        subtopic.setParentTopic(this);
    }

    public void removeSubtopic(TopicEntity subtopic) {
        this.subtopics.remove(subtopic);
        subtopic.setParentTopic(null);
    }
}
