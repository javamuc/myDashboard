package com.dshbd.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "habit_day_schedule")
public class HabitDaySchedule implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "habit_day_schedule_seq")
    @SequenceGenerator(name = "habit_day_schedule_seq", sequenceName = "habit_day_schedule_seq", allocationSize = 1)
    private Long id;

    @NotNull
    @Column(name = "day_of_week", nullable = false)
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @NotNull
    @Column(name = "schedule_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ScheduleType scheduleType;

    @Column(name = "repetitions")
    private Integer repetitions;

    @Column(name = "time_preference")
    @Enumerated(EnumType.STRING)
    private TimePreference timePreference;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "daySchedules", "user" }, allowSetters = true)
    private Habit habit;

    @OneToMany(mappedBy = "daySchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "daySchedule" }, allowSetters = true)
    private Set<HabitSpecificTime> specificTimes = new HashSet<>();

    public enum DayOfWeek {
        MONDAY,
        TUESDAY,
        WEDNESDAY,
        THURSDAY,
        FRIDAY,
        SATURDAY,
        SUNDAY,
    }

    public enum ScheduleType {
        ANYTIME,
        SPECIFIC,
    }

    public enum TimePreference {
        MORNING,
        MIDDAY,
        AFTERNOON,
        EVENING,
        SPECIFIC_TIMES,
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public ScheduleType getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(ScheduleType scheduleType) {
        this.scheduleType = scheduleType;
    }

    public Integer getRepetitions() {
        return repetitions;
    }

    public void setRepetitions(Integer repetitions) {
        this.repetitions = repetitions;
    }

    public TimePreference getTimePreference() {
        return timePreference;
    }

    public void setTimePreference(TimePreference timePreference) {
        this.timePreference = timePreference;
    }

    public Habit getHabit() {
        return habit;
    }

    public void setHabit(Habit habit) {
        this.habit = habit;
    }

    public Set<HabitSpecificTime> getSpecificTimes() {
        return specificTimes;
    }

    public void setSpecificTimes(Set<HabitSpecificTime> specificTimes) {
        this.specificTimes = specificTimes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HabitDaySchedule)) {
            return false;
        }
        return id != null && id.equals(((HabitDaySchedule) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "HabitDaySchedule{" +
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
            "}"
        );
    }
}
