package com.dshbd.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "board")
public class Board implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "started", nullable = false)
    private boolean started = false;

    @Column(name = "to_do_limit", nullable = false)
    private Integer toDoLimit = 5;

    @Column(name = "progress_limit", nullable = false)
    private Integer progressLimit = 2;

    @CreationTimestamp
    @Column(name = "created_date")
    private Instant createdDate;

    private Long ownerId;

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

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
