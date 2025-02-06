package com.dshbd.service.dto;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

public class BoardDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private String description;

    private boolean started = false;

    private Integer toDoLimit = 5;

    private Integer progressLimit = 3;

    private boolean archived = false;

    private boolean autoPull = false;

    private Long ownerId;

    private Instant createdDate;

    private Instant lastModifiedDate;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }

    public Integer getToDoLimit() {
        return toDoLimit;
    }

    public void setToDoLimit(Integer toDoLimit) {
        this.toDoLimit = toDoLimit;
    }

    public Integer getProgressLimit() {
        return progressLimit;
    }

    public void setProgressLimit(Integer progressLimit) {
        this.progressLimit = progressLimit;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public boolean isAutoPull() {
        return autoPull;
    }

    public void setAutoPull(boolean autoPull) {
        this.autoPull = autoPull;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
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
        if (!(o instanceof BoardDTO)) {
            return false;
        }

        return id != null && id.equals(((BoardDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "BoardDTO{" +
            "id=" +
            getId() +
            ", title='" +
            getTitle() +
            "'" +
            ", description='" +
            getDescription() +
            "'" +
            ", started='" +
            isStarted() +
            "'" +
            ", toDoLimit=" +
            getToDoLimit() +
            ", progressLimit=" +
            getProgressLimit() +
            ", archived='" +
            isArchived() +
            "'" +
            ", autoPull='" +
            isAutoPull() +
            "'" +
            ", ownerId=" +
            getOwnerId() +
            ", createdDate='" +
            getCreatedDate() +
            "'" +
            ", lastModifiedDate='" +
            getLastModifiedDate() +
            "'" +
            "}"
        );
    }
}
