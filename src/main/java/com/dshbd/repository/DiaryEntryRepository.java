package com.dshbd.repository;

import com.dshbd.domain.DiaryEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    Page<DiaryEntry> findByUserIdOrderByCreatedDateDesc(Long userId, Pageable pageable);
    void deleteByUserIdAndId(Long userId, Long id);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM DiaryEntry d JOIN d.tags t WHERE t = :tagName")
    boolean existsByTags(@Param("tagName") String tagName);
}
