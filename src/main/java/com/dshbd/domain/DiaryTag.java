package com.dshbd.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "diary_tag")
public class DiaryTag implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "diary_tag_sequence")
    @SequenceGenerator(name = "diary_tag_sequence", sequenceName = "diary_tag_sequence", allocationSize = 1)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "archived")
    private boolean archived = false;

    @NotNull
    @Column(name = "created_date", nullable = false)
    @CreationTimestamp
    private Instant createdDate;

    @Column(name = "last_modified_date")
    @UpdateTimestamp
    private Instant lastModifiedDate;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
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

    @PrePersist
    public void prePersist() {
        createdDate = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastModifiedDate = Instant.now();
    }
}
