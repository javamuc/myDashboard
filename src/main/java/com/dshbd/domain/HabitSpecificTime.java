package com.dshbd.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Entity
@Table(name = "habit_specific_time")
public class HabitSpecificTime implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "habit_specific_time_seq")
    @SequenceGenerator(name = "habit_specific_time_seq", sequenceName = "habit_specific_time_seq", allocationSize = 1)
    private Long id;

    @NotNull
    @Column(name = "hour_value", nullable = false)
    private Integer hour;

    @NotNull
    @Column(name = "minute_value", nullable = false)
    private Integer minute;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "specificTimes", "habit" }, allowSetters = true)
    private HabitDaySchedule daySchedule;

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

    public HabitDaySchedule getDaySchedule() {
        return daySchedule;
    }

    public void setDaySchedule(HabitDaySchedule daySchedule) {
        this.daySchedule = daySchedule;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HabitSpecificTime)) {
            return false;
        }
        return id != null && id.equals(((HabitSpecificTime) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "HabitSpecificTime{" + "id=" + getId() + ", hour=" + getHour() + ", minute=" + getMinute() + "}";
    }
}
