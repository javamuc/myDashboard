package com.dshbd.service.dto;

import com.dshbd.domain.HabitSpecificTime;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

public class HabitSpecificTimeDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer hour;

    @NotNull
    private Integer minute;

    private Long dayScheduleId;

    public HabitSpecificTimeDTO() {
        // Empty constructor needed for Jackson.
    }

    public HabitSpecificTimeDTO(HabitSpecificTime specificTime) {
        this.id = specificTime.getId();
        this.hour = specificTime.getHour();
        this.minute = specificTime.getMinute();
        this.dayScheduleId = specificTime.getDaySchedule().getId();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getHour() {
        return hour;
    }

    public void setHour(Integer hour) {
        this.hour = hour;
    }

    public Integer getMinute() {
        return minute;
    }

    public void setMinute(Integer minute) {
        this.minute = minute;
    }

    public Long getDayScheduleId() {
        return dayScheduleId;
    }

    public void setDayScheduleId(Long dayScheduleId) {
        this.dayScheduleId = dayScheduleId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HabitSpecificTimeDTO)) {
            return false;
        }

        HabitSpecificTimeDTO timeDTO = (HabitSpecificTimeDTO) o;
        if (this.id == null) {
            return false;
        }
        return this.id.equals(timeDTO.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "HabitSpecificTimeDTO{" +
            "id=" +
            getId() +
            ", hour=" +
            getHour() +
            ", minute=" +
            getMinute() +
            ", dayScheduleId=" +
            getDayScheduleId() +
            "}"
        );
    }
}
