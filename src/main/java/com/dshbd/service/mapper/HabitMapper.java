package com.dshbd.service.mapper;

import com.dshbd.domain.Habit;
import com.dshbd.domain.HabitDaySchedule;
import com.dshbd.domain.HabitSpecificTime;
import com.dshbd.domain.User;
import com.dshbd.service.dto.HabitDTO;
import com.dshbd.service.dto.HabitDayScheduleDTO;
import com.dshbd.service.dto.HabitSpecificTimeDTO;
import org.springframework.stereotype.Service;

@Service
public class HabitMapper {

    public HabitDTO toDto(Habit habit) {
        return new HabitDTO(habit);
    }

    public Habit toEntity(HabitDTO habitDTO, User user) {
        if (habitDTO == null) {
            return null;
        }

        Habit habit = new Habit();
        habit.setId(habitDTO.getId());
        habit.setName(habitDTO.getName());
        habit.setDescription(habitDTO.getDescription());
        habit.setActive(habitDTO.isActive());
        habit.setScheduleType(habitDTO.getScheduleType());
        habit.setUser(user);

        habitDTO
            .getDaySchedules()
            .forEach(dayScheduleDTO -> {
                HabitDaySchedule daySchedule = toDayScheduleEntity(dayScheduleDTO);
                daySchedule.setHabit(habit);
                habit.getDaySchedules().add(daySchedule);
            });

        return habit;
    }

    private HabitDaySchedule toDayScheduleEntity(HabitDayScheduleDTO dto) {
        if (dto == null) {
            return null;
        }

        HabitDaySchedule daySchedule = new HabitDaySchedule();
        daySchedule.setId(dto.getId());
        daySchedule.setDayOfWeek(dto.getDayOfWeek());
        daySchedule.setScheduleType(dto.getScheduleType());
        daySchedule.setRepetitions(dto.getRepetitions());
        daySchedule.setTimePreference(dto.getTimePreference());

        dto
            .getSpecificTimes()
            .forEach(timeDTO -> {
                HabitSpecificTime specificTime = toSpecificTimeEntity(timeDTO);
                specificTime.setDaySchedule(daySchedule);
                daySchedule.getSpecificTimes().add(specificTime);
            });

        return daySchedule;
    }

    private HabitSpecificTime toSpecificTimeEntity(HabitSpecificTimeDTO dto) {
        if (dto == null) {
            return null;
        }

        HabitSpecificTime specificTime = new HabitSpecificTime();
        specificTime.setId(dto.getId());
        specificTime.setHour(dto.getHour());
        specificTime.setMinute(dto.getMinute());

        return specificTime;
    }
}
