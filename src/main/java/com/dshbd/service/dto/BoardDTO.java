package com.dshbd.service.dto;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

public class BoardDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private String description;

    private int toDoLimit;

    private int progressLimit;

    private boolean autoPull;

    private boolean started;

    private boolean archived;

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

    public int getToDoLimit() {
        return toDoLimit;
    }

    public void setToDoLimit(int toDoLimit) {
        this.toDoLimit = toDoLimit;
    }

    public int getProgressLimit() {
        return progressLimit;
    }

    public void setProgressLimit(int progressLimit) {
        this.progressLimit = progressLimit;
    }

    public boolean isAutoPull() {
        return autoPull;
    }

    public void setAutoPull(boolean autoPull) {
        this.autoPull = autoPull;
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }
}
