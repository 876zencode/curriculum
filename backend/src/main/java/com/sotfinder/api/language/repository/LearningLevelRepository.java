package com.sotfinder.api.language.repository;

import com.sotfinder.api.language.entity.LearningLevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningLevelRepository extends JpaRepository<LearningLevelEntity, Long> {
}
