package com.dshbd.service;

import com.dshbd.domain.Board;
import com.dshbd.domain.DiaryEntry;
import com.dshbd.domain.DiaryTag;
import com.dshbd.domain.Habit;
import com.dshbd.domain.HabitDaySchedule;
import com.dshbd.domain.HabitSpecificTime;
import com.dshbd.domain.Idea;
import com.dshbd.domain.Note;
import com.dshbd.domain.Task;
import com.dshbd.repository.BoardRepository;
import com.dshbd.repository.DiaryEntryRepository;
import com.dshbd.repository.DiaryTagRepository;
import com.dshbd.repository.HabitDayScheduleRepository;
import com.dshbd.repository.HabitRepository;
import com.dshbd.repository.HabitSpecificTimeRepository;
import com.dshbd.repository.IdeaRepository;
import com.dshbd.repository.NoteSummaryRepository;
import com.dshbd.repository.TaskRepository;
import com.dshbd.service.dto.ImportDataDTO;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ImportService extends BaseService {

    private final Logger log = LoggerFactory.getLogger(ImportService.class);

    private final IdeaRepository ideaRepository;
    private final NoteSummaryRepository noteRepository;
    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final HabitDayScheduleRepository habitDayScheduleRepository;
    private final HabitSpecificTimeRepository habitSpecificTimeRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final DiaryTagRepository diaryTagRepository;

    public ImportService(
        IdeaRepository ideaRepository,
        NoteSummaryRepository noteRepository,
        BoardRepository boardRepository,
        TaskRepository taskRepository,
        HabitRepository habitRepository,
        HabitDayScheduleRepository habitDayScheduleRepository,
        HabitSpecificTimeRepository habitSpecificTimeRepository,
        DiaryEntryRepository diaryEntryRepository,
        DiaryTagRepository diaryTagRepository,
        UserService userService
    ) {
        super(userService);
        this.ideaRepository = ideaRepository;
        this.noteRepository = noteRepository;
        this.boardRepository = boardRepository;
        this.taskRepository = taskRepository;
        this.habitRepository = habitRepository;
        this.habitDayScheduleRepository = habitDayScheduleRepository;
        this.habitSpecificTimeRepository = habitSpecificTimeRepository;
        this.diaryEntryRepository = diaryEntryRepository;
        this.diaryTagRepository = diaryTagRepository;
    }

    @Transactional
    public void importData(ImportDataDTO importData) {
        log.debug("Importing data: {}", importData);

        Long userId = getUserId();

        // Import diary entries and tags
        if (importData.getData().getDiaryEntries() != null) {
            // First, import all tags to ensure they exist
            Map<String, DiaryTag> tagCache = new HashMap<>();
            for (ImportDataDTO.ImportDiaryEntryDTO entryDTO : importData.getData().getDiaryEntries()) {
                if (entryDTO.getTags() != null) {
                    for (ImportDataDTO.ImportDiaryTagDTO tagDTO : entryDTO.getTags()) {
                        try {
                            if (!tagCache.containsKey(tagDTO.getName())) {
                                DiaryTag tag = diaryTagRepository
                                    .findByUserIdAndName(userId, tagDTO.getName())
                                    .orElseGet(() -> {
                                        DiaryTag newTag = new DiaryTag();
                                        newTag.setId(null);
                                        newTag.setName(tagDTO.getName());
                                        newTag.setArchived(tagDTO.isArchived());
                                        newTag.setCreatedDate(tagDTO.getCreatedDate() != null ? tagDTO.getCreatedDate() : Instant.now());
                                        newTag.setLastModifiedDate(
                                            tagDTO.getLastModifiedDate() != null ? tagDTO.getLastModifiedDate() : Instant.now()
                                        );
                                        newTag.setUserId(userId);
                                        return diaryTagRepository.save(newTag);
                                    });
                                tagCache.put(tag.getName(), tag);
                            }
                        } catch (Exception e) {
                            log.error("Error importing diary tag: {}", tagDTO.getName(), e);
                        }
                    }
                }
            }

            // Then import diary entries
            for (ImportDataDTO.ImportDiaryEntryDTO entryDTO : importData.getData().getDiaryEntries()) {
                try {
                    DiaryEntry entry = new DiaryEntry();
                    entry.setId(null);
                    entry.setContent(entryDTO.getContent());
                    entry.setEmoticon(entryDTO.getEmoticon());
                    entry.setCreatedDate(entryDTO.getCreatedDate() != null ? entryDTO.getCreatedDate() : Instant.now());
                    entry.setLastModifiedDate(entryDTO.getLastModifiedDate() != null ? entryDTO.getLastModifiedDate() : Instant.now());
                    entry.setUserId(userId);

                    // Set tags
                    if (entryDTO.getTags() != null) {
                        Set<DiaryTag> tags = entryDTO
                            .getTags()
                            .stream()
                            .map(tagDTO -> tagCache.get(tagDTO.getName()))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toSet());
                        entry.setTags(tags);
                    }

                    diaryEntryRepository.save(entry);
                    log.debug("Imported diary entry with content: {}", entry.getContent());
                } catch (Exception e) {
                    log.error("Error importing diary entry: {}", entryDTO.getContent(), e);
                }
            }
            diaryEntryRepository.flush();
            diaryTagRepository.flush();
        }

        // Import ideas
        if (importData.getData().getIdeas() != null) {
            for (ImportDataDTO.ImportIdeaDTO ideaDTO : importData.getData().getIdeas()) {
                try {
                    Idea idea = new Idea();
                    idea.setId(null); // Explicitly set ID to null
                    idea.setContent(ideaDTO.getContent());
                    idea.setCreatedDate(ideaDTO.getCreatedDate());
                    idea.setLastUpdatedDate(ideaDTO.getLastUpdatedDate());
                    idea.setOwnerId(userId);
                    ideaRepository.save(idea);
                    log.debug("Imported idea: {}", idea.getContent());
                } catch (Exception e) {
                    log.error("Error importing idea: {}", ideaDTO.getContent(), e);
                }
            }
            ideaRepository.flush();
        }

        // Import notes
        if (importData.getData().getNotes() != null) {
            for (ImportDataDTO.ImportNoteDTO noteDTO : importData.getData().getNotes()) {
                try {
                    Note note = new Note();
                    note.setId(null); // Explicitly set ID to null
                    note.setTitle(noteDTO.getTitle());
                    note.setContent(noteDTO.getContent());
                    note.setCreatedDate(noteDTO.getCreatedDate());
                    note.setLastModifiedDate(noteDTO.getLastModifiedDate());
                    note.setUserId(userId);
                    noteRepository.save(note);
                    log.debug("Imported note: {}", note.getTitle());
                } catch (Exception e) {
                    log.error("Error importing note: {}", noteDTO.getTitle(), e);
                }
            }
            noteRepository.flush();
        }

        // Import boards and their tasks
        if (importData.getData().getBoards() != null) {
            for (ImportDataDTO.ImportBoardDTO boardDTO : importData.getData().getBoards()) {
                try {
                    Board board = new Board();
                    board.setId(null); // Explicitly set ID to null
                    board.setTitle(boardDTO.getTitle());
                    board.setDescription(boardDTO.getDescription());
                    board.setStarted(boardDTO.isStarted());
                    board.setToDoLimit(boardDTO.getToDoLimit());
                    board.setProgressLimit(boardDTO.getProgressLimit());
                    board.setCreatedDate(boardDTO.getCreatedDate());
                    board.setArchived(boardDTO.isArchived());
                    board.setAutoPull(boardDTO.isAutoPull());
                    board.setOwnerId(userId);
                    Board savedBoard = boardRepository.save(board);
                    log.debug("Imported board: {}", board.getTitle());

                    // Import tasks for this board
                    if (boardDTO.getTasks() != null) {
                        for (ImportDataDTO.ImportTaskDTO taskDTO : boardDTO.getTasks()) {
                            try {
                                Task task = new Task();
                                task.setId(null); // Explicitly set ID to null to ensure a new ID is generated
                                task.setTitle(taskDTO.getTitle());
                                task.setDescription(taskDTO.getDescription());
                                task.setDueDate(taskDTO.getDueDate());
                                task.setPriority(taskDTO.getPriority());
                                task.setStatus(taskDTO.getStatus());
                                task.setAssignee(taskDTO.getAssignee());
                                task.setCreatedDate(taskDTO.getCreatedDate());
                                task.setLastModifiedDate(taskDTO.getLastModifiedDate());
                                task.setPosition(taskDTO.getPosition());
                                task.setBoardId(savedBoard.getId());

                                // Save each task individually to better identify which one causes the error
                                taskRepository.save(task);
                                log.debug("Imported task: {}", task.getTitle());
                            } catch (Exception e) {
                                log.error("Error importing task: {}", taskDTO.getTitle(), e);
                                // Continue with other tasks even if one fails
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("Error importing board: {}", boardDTO.getTitle(), e);
                }
            }
            // Flush at the end
            boardRepository.flush();
            taskRepository.flush();
        }

        // Import habits and their schedules
        if (importData.getData().getHabits() != null) {
            for (ImportDataDTO.ImportHabitDTO habitDTO : importData.getData().getHabits()) {
                try {
                    Habit habit = new Habit();
                    habit.setId(null); // Explicitly set ID to null
                    habit.setName(habitDTO.getName());
                    habit.setDescription(habitDTO.getDescription());
                    habit.setActive(habitDTO.isActive());
                    habit.setScheduleType(Habit.ScheduleType.valueOf(habitDTO.getScheduleType()));
                    habit.setUserId(userId);
                    habit.setCreatedDate(habitDTO.getCreatedDate());
                    habit.setLastModifiedDate(habitDTO.getLastModifiedDate());
                    Habit savedHabit = habitRepository.save(habit);
                    log.debug("Imported habit: {}", habit.getName());

                    // Import day schedules
                    if (habitDTO.getDaySchedules() != null) {
                        for (ImportDataDTO.ImportHabitDayScheduleDTO scheduleDTO : habitDTO.getDaySchedules()) {
                            try {
                                HabitDaySchedule daySchedule = new HabitDaySchedule();
                                daySchedule.setId(null); // Explicitly set ID to null
                                daySchedule.setDayOfWeek(HabitDaySchedule.DayOfWeek.valueOf(scheduleDTO.getDayOfWeek()));
                                daySchedule.setScheduleType(HabitDaySchedule.ScheduleType.valueOf(scheduleDTO.getScheduleType()));
                                daySchedule.setRepetitions(scheduleDTO.getRepetitions());
                                daySchedule.setHabit(savedHabit);
                                HabitDaySchedule savedSchedule = habitDayScheduleRepository.save(daySchedule);
                                log.debug("Imported day schedule for habit: {}", habit.getName());

                                // Import specific times
                                if (scheduleDTO.getSpecificTimes() != null) {
                                    for (ImportDataDTO.ImportHabitSpecificTimeDTO timeDTO : scheduleDTO.getSpecificTimes()) {
                                        try {
                                            HabitSpecificTime specificTime = new HabitSpecificTime();
                                            specificTime.setId(null); // Explicitly set ID to null
                                            specificTime.setHour(timeDTO.getHour());
                                            specificTime.setMinute(timeDTO.getMinute());
                                            specificTime.setDaySchedule(savedSchedule);
                                            habitSpecificTimeRepository.save(specificTime);
                                            log.debug("Imported specific time for habit day schedule");
                                        } catch (Exception e) {
                                            log.error("Error importing specific time for habit: {}", habit.getName(), e);
                                        }
                                    }
                                }
                            } catch (Exception e) {
                                log.error("Error importing day schedule for habit: {}", habit.getName(), e);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("Error importing habit: {}", habitDTO.getName(), e);
                }
            }
            // Flush at the end
            habitRepository.flush();
            habitDayScheduleRepository.flush();
            habitSpecificTimeRepository.flush();
        }
    }
}
