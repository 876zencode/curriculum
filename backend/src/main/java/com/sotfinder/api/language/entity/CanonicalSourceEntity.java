package com.sotfinder.api.language.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "canonical_sources")
public class CanonicalSourceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pk_id;

    @Column(name = "source_id", unique = true)
    private String id; // Business ID

    private String title;
    private String url;
    private String steward;
    private String type;
    private double confidence;

    @Column(name = "short_summary", columnDefinition = "TEXT")
    private String shortSummary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_id")
    private CurriculumEntity curriculum;

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

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getSteward() {
        return steward;
    }

    public void setSteward(String steward) {
        this.steward = steward;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getShortSummary() {
        return shortSummary;
    }

    public void setShortSummary(String shortSummary) {
        this.shortSummary = shortSummary;
    }

    public CurriculumEntity getCurriculum() {
        return curriculum;
    }

    public void setCurriculum(CurriculumEntity curriculum) {
        this.curriculum = curriculum;
    }
}
