package com.sotfinder.api.language.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "learning_levels")
public class LearningLevelEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String level;

    @Column(name = "estimated_hours")
    private int estimatedHours;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_id")
    private CurriculumEntity curriculum;

    @OneToMany(mappedBy = "learningLevel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TopicEntity> topics = new ArrayList<>();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public int getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(int estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public CurriculumEntity getCurriculum() {
        return curriculum;
    }

    public void setCurriculum(CurriculumEntity curriculum) {
        this.curriculum = curriculum;
    }

    public List<TopicEntity> getTopics() {
        return topics;
    }

    public void setTopics(List<TopicEntity> topics) {
        this.topics = topics;
    }

    // Helper methods to manage relationships
    public void addTopic(TopicEntity topic) {
        this.topics.add(topic);
        topic.setLearningLevel(this);
    }

    public void removeTopic(TopicEntity topic) {
        this.topics.remove(topic);
        topic.setLearningLevel(null);
    }
}
