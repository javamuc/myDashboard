package com.dshbd.repository;

import com.dshbd.domain.HabitDaySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitDayScheduleRepository extends JpaRepository<HabitDaySchedule, Long> {}
