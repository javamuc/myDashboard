package com.dshbd.service.dto;

import com.dshbd.domain.HabitDaySchedule;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class HabitDayScheduleDTO implements Serializable {

    private Long id;

    @NotNull
    private HabitDaySchedule.DayOfWeek dayOfWeek;

    @NotNull
    private HabitDaySchedule.ScheduleType scheduleType;

    private Integer repetitions;

    private HabitDaySchedule.TimePreference timePreference;

    private Set<HabitSpecificTimeDTO> specificTimes = new HashSet<>();

    private Long habitId;

    public HabitDayScheduleDTO() {
        // Empty constructor needed for Jackson.
    }

    public HabitDayScheduleDTO(HabitDaySchedule daySchedule) {
        this.id = daySchedule.getId();
        this.dayOfWeek = daySchedule.getDayOfWeek();
        this.scheduleType = daySchedule.getScheduleType();
        this.repetitions = daySchedule.getRepetitions();
        this.timePreference = daySchedule.getTimePreference();
        this.habitId = daySchedule.getHabit().getId();
        this.specificTimes = daySchedule.getSpecificTimes().stream().map(HabitSpecificTimeDTO::new).collect(Collectors.toSet());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HabitDaySchedule.DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(HabitDaySchedule.DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public HabitDaySchedule.ScheduleType getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(HabitDaySchedule.ScheduleType scheduleType) {
        this.scheduleType = scheduleType;
    }

    public Integer getRepetitions() {
        return repetitions;
    }

    public void setRepetitions(Integer repetitions) {
        this.repetitions = repetitions;
    }

    public HabitDaySchedule.TimePreference getTimePreference() {
        return timePreference;
    }

    public void setTimePreference(HabitDaySchedule.TimePreference timePreference) {
        this.timePreference = timePreference;
    }

    public Set<HabitSpecificTimeDTO> getSpecificTimes() {
        return specificTimes;
    }

    public void setSpecificTimes(Set<HabitSpecificTimeDTO> specificTimes) {
        this.specificTimes = specificTimes;
    }

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HabitDayScheduleDTO)) {
            return false;
        }

        HabitDayScheduleDTO dayScheduleDTO = (HabitDayScheduleDTO) o;
        if (this.id == null) {
            return false;
        }
        return this.id.equals(dayScheduleDTO.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "HabitDayScheduleDTO{" +
            "id=" +
            getId() +
            ", dayOfWeek='" +
            getDayOfWeek() +
            "'" +
            ", scheduleType='" +
            getScheduleType() +
            "'" +
            ", repetitions=" +
            getRepetitions() +
            ", timePreference='" +
            getTimePreference() +
            "'" +
            ", habitId=" +
            getHabitId() +
            "}"
        );
    }
}
