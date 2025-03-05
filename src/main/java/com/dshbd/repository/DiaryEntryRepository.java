package com.dshbd.repository;

import com.dshbd.domain.DiaryEntry;
import java.util.Set;
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

    void deleteAllByUserId(Long userId);

    Page<DiaryEntry> findByUserIdAndEmoticonOrderByCreatedDateDesc(Long userId, String emoticon, Pageable pageable);

    @Query("SELECT DISTINCT d FROM DiaryEntry d JOIN d.tags t WHERE d.userId = :userId AND t.name IN :tagNames ORDER BY d.createdDate DESC")
    Page<DiaryEntry> findByUserIdAndTagsNameInOrderByCreatedDateDesc(
        @Param("userId") Long userId,
        @Param("tagNames") Set<String> tagNames,
        Pageable pageable
    );

    @Query(
        "SELECT DISTINCT d FROM DiaryEntry d JOIN d.tags t WHERE d.userId = :userId AND d.emoticon = :emoticon AND t.name IN :tagNames ORDER BY d.createdDate DESC"
    )
    Page<DiaryEntry> findByUserIdAndEmoticonAndTagsNameInOrderByCreatedDateDesc(
        @Param("userId") Long userId,
        @Param("emoticon") String emoticon,
        @Param("tagNames") Set<String> tagNames,
        Pageable pageable
    );
}
