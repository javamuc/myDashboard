package com.dshbd.repository;

import com.dshbd.domain.HabitRecord;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitRecordRepository extends JpaRepository<HabitRecord, Long> {
    // @Query("SELECT hr FROM HabitRecord hr WHERE hr.user.id = :userId AND hr.recordDate = :date")
    List<HabitRecord> findAllByUserIdAndRecordDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    // @Query("SELECT hr FROM HabitRecord hr WHERE hr.user.id = :userId AND hr.recordDate BETWEEN :startDate AND :endDate")
    List<HabitRecord> findAllByUserIdAndRecordDateBetween(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // @Query("SELECT hr FROM HabitRecord hr WHERE hr.user.id = :userId AND hr.habit.id = :habitId AND hr.recordDate = :date")
    List<HabitRecord> findAllByUserIdAndHabitIdAndRecordDate(
        @Param("userId") Long userId,
        @Param("habitId") Long habitId,
        @Param("date") LocalDate date
    );
}
