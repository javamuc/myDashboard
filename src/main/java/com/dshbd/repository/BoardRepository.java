package com.dshbd.repository;

import com.dshbd.domain.Board;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByOwnerId(Long ownerId);

    Optional<Board> findByIdAndOwnerId(Long id, Long ownerId);
}
