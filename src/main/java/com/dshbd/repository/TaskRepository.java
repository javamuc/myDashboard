package com.dshbd.repository;

import com.dshbd.domain.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBoardId(Long boardId);

    List<Task> findByBoardIdAndStatus(Long boardId, String status);

    List<Task> findByStatus(String status);

    List<Task> findByBoardIdInAndStatus(List<Long> boardIds, String status);
}
