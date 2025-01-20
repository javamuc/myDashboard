package com.dshbd.repository;

import com.dshbd.domain.Note;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdOrderByLastModifiedDateDesc(Long userId);
}
