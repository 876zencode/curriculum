package com.sotfinder.api.language.repository;

import com.sotfinder.api.language.entity.TopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<TopicEntity, Long> {
    Optional<TopicEntity> findById(String id);
}
