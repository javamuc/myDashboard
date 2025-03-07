package com.dshbd.repository;

import com.dshbd.domain.Note;
import com.dshbd.domain.vm.NoteSummary;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteSummaryRepository extends JpaRepository<Note, Long> {
    List<NoteSummary> findByUserIdOrderByLastModifiedDateDesc(Long userId);
}
