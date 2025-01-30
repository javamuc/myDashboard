package com.dshbd.repository;

import com.dshbd.domain.HabitSpecificTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HabitSpecificTimeRepository extends JpaRepository<HabitSpecificTime, Long> {}
