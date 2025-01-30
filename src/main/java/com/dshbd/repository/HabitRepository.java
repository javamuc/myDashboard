package com.dshbd.repository;

import com.dshbd.domain.Habit;
import com.dshbd.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link Habit} entity.
 */
@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserOrderByCreatedDateDesc(User user);
    List<Habit> findByUserAndActiveIsTrueOrderByCreatedDateDesc(User user);
    void deleteByIdAndUser(Long id, User user);
}
