package com.dshbd.domain.vm;

import java.time.Instant;

public class NoteSummary {

    private Long id;
    private String title;
    private Instant lastModifiedDate;

    public NoteSummary(Long id, String title, Instant lastModifiedDate) {
        this.id = id;
        this.title = title;
        this.lastModifiedDate = lastModifiedDate;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }
}
