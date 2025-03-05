package com.dshbd.repository;

import com.dshbd.domain.DiaryTag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryTagRepository extends JpaRepository<DiaryTag, Long> {
    List<DiaryTag> findByUserIdOrderByCreatedDateDesc(Long userId);
    List<DiaryTag> findByUserIdAndArchivedFalseOrderByCreatedDateDesc(Long userId);
    long countByUserIdAndArchivedFalse(Long userId);
    boolean existsByUserIdAndNameAndArchivedFalse(Long userId, String name);
    Optional<DiaryTag> findByUserIdAndName(Long userId, String name);
}
