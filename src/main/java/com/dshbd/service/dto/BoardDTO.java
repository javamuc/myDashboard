package com.dshbd.service.dto;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

public class BoardDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private String description;

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
}
