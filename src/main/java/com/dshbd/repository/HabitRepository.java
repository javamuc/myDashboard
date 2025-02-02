package com.dshbd.repository;

import com.dshbd.domain.Habit;
import com.dshbd.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link Habit} entity.
 */
@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserIdOrderByCreatedDateDesc(Long userId);
    List<Habit> findByUserIdAndActiveIsTrueOrderByCreatedDateDesc(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("update Habit h set h.active = :active where h.id = :id and h.userId = :userId")
    int setActiveForHabit(@Param("active") boolean active, @Param("id") long id, @Param("userId") long userId);
}
