package com.dshbd.service.dto;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class HabitRecordDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate recordDate;

    private Instant createdDate;

    @NotNull
    private Long habitId;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof HabitRecordDTO)) return false;
        HabitRecordDTO that = (HabitRecordDTO) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "HabitRecordDTO{" +
            "id=" +
            getId() +
            ", recordDate='" +
            getRecordDate() +
            "'" +
            ", createdDate='" +
            getCreatedDate() +
            "'" +
            ", habitId=" +
            getHabitId() +
            "}"
        );
    }
}
