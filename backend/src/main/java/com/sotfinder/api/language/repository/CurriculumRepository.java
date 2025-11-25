package com.sotfinder.api.language.repository;

import com.sotfinder.api.language.entity.CurriculumEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CurriculumRepository extends JpaRepository<CurriculumEntity, Long> {
    Optional<CurriculumEntity> findByLanguage(String language);
}
