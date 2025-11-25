package com.sotfinder.api.language.repository;

import com.sotfinder.api.language.entity.PracticeProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeProjectRepository extends JpaRepository<PracticeProjectEntity, Long> {
}
