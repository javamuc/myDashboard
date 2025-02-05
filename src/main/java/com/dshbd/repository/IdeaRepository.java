package com.dshbd.repository;

import com.dshbd.domain.Idea;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findByOwnerId(Long ownerId);
    Optional<Idea> findByIdAndOwnerId(Long id, Long ownerId);
    int deleteByIdAndOwnerId(Long id, Long ownerId);
}
