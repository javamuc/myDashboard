package com.dshbd.repository;

import com.dshbd.domain.DiaryEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    Page<DiaryEntry> findByUserIdOrderByCreatedDateDesc(Long userId, Pageable pageable);
    void deleteByUserIdAndId(Long userId, Long id);
}
