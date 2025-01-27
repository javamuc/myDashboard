package com.dshbd.repository;

import com.dshbd.domain.Idea;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {
    List<Idea> findByOwnerId(Long ownerId);
}
