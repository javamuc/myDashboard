package com.dshbd.service.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

public class ImportDataDTO {

    @NotNull
    private String version;

    @NotNull
    private String exportDate;

    @NotNull
    private ImportDataContentDTO data;

    public static class ImportDataContentDTO {

        private List<ImportIdeaDTO> ideas;
        private List<ImportNoteDTO> notes;
        private List<ImportBoardDTO> boards;
        private List<ImportHabitDTO> habits;
        private List<ImportDiaryEntryDTO> diaryEntries;

        public List<ImportIdeaDTO> getIdeas() {
            return ideas;
        }

        public void setIdeas(List<ImportIdeaDTO> ideas) {
            this.ideas = ideas;
        }

        public List<ImportNoteDTO> getNotes() {
            return notes;
        }

        public void setNotes(List<ImportNoteDTO> notes) {
            this.notes = notes;
        }

        public List<ImportBoardDTO> getBoards() {
            return boards;
        }

        public void setBoards(List<ImportBoardDTO> boards) {
            this.boards = boards;
        }

        public List<ImportHabitDTO> getHabits() {
            return habits;
        }

        public void setHabits(List<ImportHabitDTO> habits) {
            this.habits = habits;
        }

        public List<ImportDiaryEntryDTO> getDiaryEntries() {
            return diaryEntries;
        }

        public void setDiaryEntries(List<ImportDiaryEntryDTO> diaryEntries) {
            this.diaryEntries = diaryEntries;
        }
    }

    public static class ImportIdeaDTO {

        @NotNull
        private String content;

        private Instant createdDate;
        private Instant lastUpdatedDate;

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

        public Instant getLastUpdatedDate() {
            return lastUpdatedDate;
        }

        public void setLastUpdatedDate(Instant lastUpdatedDate) {
            this.lastUpdatedDate = lastUpdatedDate;
        }
    }

    public static class ImportNoteDTO {

        @NotNull
        private String title;

        private String content;
        private Instant createdDate;
        private Instant lastModifiedDate;

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
    }

    public static class ImportBoardDTO {

        @NotNull
        private String title;

        private String description;
        private boolean started;
        private int toDoLimit;
        private int progressLimit;
        private Instant createdDate;
        private boolean archived;
        private boolean autoPull;
        private List<ImportTaskDTO> tasks;

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

        public Instant getCreatedDate() {
            return createdDate;
        }

        public void setCreatedDate(Instant createdDate) {
            this.createdDate = createdDate;
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

        public List<ImportTaskDTO> getTasks() {
            return tasks;
        }

        public void setTasks(List<ImportTaskDTO> tasks) {
            this.tasks = tasks;
        }
    }

    public static class ImportTaskDTO {

        @NotNull
        private String title;

        private String description;
        private Instant dueDate;
        private int priority;

        @NotNull
        private String status;

        private String assignee;
        private Instant createdDate;
        private Instant lastModifiedDate;
        private int position;

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

        public Instant getDueDate() {
            return dueDate;
        }

        public void setDueDate(Instant dueDate) {
            this.dueDate = dueDate;
        }

        public int getPriority() {
            return priority;
        }

        public void setPriority(int priority) {
            this.priority = priority;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getAssignee() {
            return assignee;
        }

        public void setAssignee(String assignee) {
            this.assignee = assignee;
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

        public int getPosition() {
            return position;
        }

        public void setPosition(int position) {
            this.position = position;
        }
    }

    public static class ImportHabitDTO {

        @NotNull
        private String name;

        private String description;
        private boolean active;
        private String scheduleType;
        private Instant createdDate;
        private Instant lastModifiedDate;
        private List<ImportHabitDayScheduleDTO> daySchedules;

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

        public String getScheduleType() {
            return scheduleType;
        }

        public void setScheduleType(String scheduleType) {
            this.scheduleType = scheduleType;
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

        public List<ImportHabitDayScheduleDTO> getDaySchedules() {
            return daySchedules;
        }

        public void setDaySchedules(List<ImportHabitDayScheduleDTO> daySchedules) {
            this.daySchedules = daySchedules;
        }
    }

    public static class ImportHabitDayScheduleDTO {

        @NotNull
        private String dayOfWeek;

        @NotNull
        private String scheduleType;

        private Integer repetitions;
        private List<ImportHabitSpecificTimeDTO> specificTimes;

        public String getDayOfWeek() {
            return dayOfWeek;
        }

        public void setDayOfWeek(String dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }

        public String getScheduleType() {
            return scheduleType;
        }

        public void setScheduleType(String scheduleType) {
            this.scheduleType = scheduleType;
        }

        public Integer getRepetitions() {
            return repetitions;
        }

        public void setRepetitions(Integer repetitions) {
            this.repetitions = repetitions;
        }

        public List<ImportHabitSpecificTimeDTO> getSpecificTimes() {
            return specificTimes;
        }

        public void setSpecificTimes(List<ImportHabitSpecificTimeDTO> specificTimes) {
            this.specificTimes = specificTimes;
        }
    }

    public static class ImportHabitSpecificTimeDTO {

        @NotNull
        private Integer hour;

        @NotNull
        private Integer minute;

        public Integer getHour() {
            return hour;
        }

        public void setHour(Integer hour) {
            this.hour = hour;
        }

        public Integer getMinute() {
            return minute;
        }

        public void setMinute(Integer minute) {
            this.minute = minute;
        }
    }

    public static class ImportDiaryEntryDTO {

        @NotNull
        private String content;

        @NotNull
        private String emoticon;

        private List<ImportDiaryTagDTO> tags;
        private Instant createdDate;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getEmoticon() {
            return emoticon;
        }

        public void setEmoticon(String emoticon) {
            this.emoticon = emoticon;
        }

        public List<ImportDiaryTagDTO> getTags() {
            return tags;
        }

        public void setTags(List<ImportDiaryTagDTO> tags) {
            this.tags = tags;
        }

        public Instant getCreatedDate() {
            return createdDate;
        }

        public void setCreatedDate(Instant createdDate) {
            this.createdDate = createdDate;
        }
    }

    public static class ImportDiaryTagDTO {

        @NotNull
        private String name;

        private boolean archived;
        private Instant createdDate;
        private Instant lastModifiedDate;

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
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getExportDate() {
        return exportDate;
    }

    public void setExportDate(String exportDate) {
        this.exportDate = exportDate;
    }

    public ImportDataContentDTO getData() {
        return data;
    }

    public void setData(ImportDataContentDTO data) {
        this.data = data;
    }
}
