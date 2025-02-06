package com.dshbd.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;

public class NoteDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 0, max = 100)
    private String title;

    private String content;

    private Instant createdDate;

    private Instant lastModifiedDate;

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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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
        if (!(o instanceof NoteDTO)) {
            return false;
        }

        return id != null && id.equals(((NoteDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "NoteDTO{" +
            "id=" +
            getId() +
            ", title='" +
            getTitle() +
            "'" +
            ", content='" +
            getContent() +
            "'" +
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
