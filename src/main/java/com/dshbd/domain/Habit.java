package com.dshbd.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * A Habit entity.
 */
@Entity
@Table(name = "habit")
public class Habit extends AbstractAuditingEntity<Long> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Size(min = 0, max = 100)
    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @NotNull
    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "schedule_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ScheduleType scheduleType = ScheduleType.DAILY;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @OneToMany(mappedBy = "habit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "habit", "specificTimes" }, allowSetters = true)
    private Set<HabitDaySchedule> daySchedules = new HashSet<>();

    @Column(name = "created_date")
    @CreationTimestamp
    private Instant createdDate;

    @Column(name = "last_modified_date")
    @UpdateTimestamp
    private Instant lastModifiedDate;

    public enum ScheduleType {
        DAILY,
        SELECTED_DAYS,
    }

    @Override
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

    public ScheduleType getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(ScheduleType scheduleType) {
        this.scheduleType = scheduleType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Set<HabitDaySchedule> getDaySchedules() {
        return daySchedules;
    }

    public void setDaySchedules(Set<HabitDaySchedule> daySchedules) {
        this.daySchedules = daySchedules;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Habit)) {
            return false;
        }
        return id != null && id.equals(((Habit) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "Habit{" +
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
            "}"
        );
    }
}
