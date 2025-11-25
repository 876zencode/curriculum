package com.sotfinder.api.language.repository;

import com.sotfinder.api.language.entity.SourceReferenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SourceReferenceRepository extends JpaRepository<SourceReferenceEntity, Long> {
}
