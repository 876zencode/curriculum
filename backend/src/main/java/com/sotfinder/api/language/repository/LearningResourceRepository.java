package com.sotfinder.api.language.repository;

import com.sotfinder.api.language.entity.LearningResourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningResourceRepository extends JpaRepository<LearningResourceEntity, Long> {
}
