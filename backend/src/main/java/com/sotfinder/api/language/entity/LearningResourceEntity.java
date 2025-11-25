package com.sotfinder.api.language.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "learning_resources")
public class LearningResourceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String url;
    private String type;

    @Column(name = "authority_score")
    private double authorityScore;

    @Column(name = "short_summary", columnDefinition = "TEXT")
    private String shortSummary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_pk_id")
    private TopicEntity topic;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getAuthorityScore() {
        return authorityScore;
    }

    public void setAuthorityScore(double authorityScore) {
        this.authorityScore = authorityScore;
    }

    public String getShortSummary() {
        return shortSummary;
    }

    public void setShortSummary(String shortSummary) {
        this.shortSummary = shortSummary;
    }

    public TopicEntity getTopic() {
        return topic;
    }

    public void setTopic(TopicEntity topic) {
        this.topic = topic;
    }
}
