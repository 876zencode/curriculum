package com.sotfinder.api.language.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "source_references")
public class SourceReferenceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_id")
    private String sourceId; // Refers to CanonicalSourceDTO.id

    private String url;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    @Column(name = "short_evidence", columnDefinition = "TEXT")
    private String shortEvidence;

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

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public String getShortEvidence() {
        return shortEvidence;
    }

    public void setShortEvidence(String shortEvidence) {
        this.shortEvidence = shortEvidence;
    }

    public TopicEntity getTopic() {
        return topic;
    }

    public void setTopic(TopicEntity topic) {
        this.topic = topic;
    }
}
