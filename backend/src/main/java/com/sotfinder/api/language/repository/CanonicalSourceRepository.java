package com.sotfinder.api.language.repository;

import com.sotfinder.api.language.entity.CanonicalSourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CanonicalSourceRepository extends JpaRepository<CanonicalSourceEntity, Long> {
    Optional<CanonicalSourceEntity> findById(String id);
}
