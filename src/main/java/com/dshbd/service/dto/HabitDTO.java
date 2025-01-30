package com.dshbd.service.dto;

import com.dshbd.domain.Habit;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class HabitDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 0, max = 100)
    private String name;

    private String description;

    @NotNull
    private boolean active = true;

    @NotNull
    private Habit.ScheduleType scheduleType = Habit.ScheduleType.DAILY;

    private Set<HabitDayScheduleDTO> daySchedules = new HashSet<>();

    private Long userId;

    private String createdBy;

    private Instant createdDate;

    private String lastModifiedBy;

    private Instant lastModifiedDate;

    public HabitDTO() {
        // Empty constructor needed for Jackson.
    }

    public HabitDTO(Habit habit) {
        this.id = habit.getId();
        this.name = habit.getName();
        this.description = habit.getDescription();
        this.active = habit.isActive();
        this.scheduleType = habit.getScheduleType();
        this.userId = habit.getUser().getId();
        this.createdBy = habit.getCreatedBy();
        this.createdDate = habit.getCreatedDate();
        this.lastModifiedBy = habit.getLastModifiedBy();
        this.lastModifiedDate = habit.getLastModifiedDate();
        this.daySchedules = habit.getDaySchedules().stream().map(HabitDayScheduleDTO::new).collect(Collectors.toSet());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Habit.ScheduleType getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(Habit.ScheduleType scheduleType) {
        this.scheduleType = scheduleType;
    }

    public Set<HabitDayScheduleDTO> getDaySchedules() {
        return daySchedules;
    }

    public void setDaySchedules(Set<HabitDayScheduleDTO> daySchedules) {
        this.daySchedules = daySchedules;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HabitDTO)) {
            return false;
        }

        HabitDTO habitDTO = (HabitDTO) o;
        if (this.id == null) {
            return false;
        }
        return this.id.equals(habitDTO.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "HabitDTO{" +
            "id=" +
            getId() +
            ", name='" +
            getName() +
            "'" +
            ", description='" +
            getDescription() +
            "'" +
            ", active='" +
            isActive() +
            "'" +
            ", scheduleType='" +
            getScheduleType() +
            "'" +
            ", userId=" +
            getUserId() +
            "}"
        );
    }
}
