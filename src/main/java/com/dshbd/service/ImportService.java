package com.dshbd.service;

import com.dshbd.domain.Board;
import com.dshbd.domain.Habit;
import com.dshbd.domain.HabitDaySchedule;
import com.dshbd.domain.HabitSpecificTime;
import com.dshbd.domain.Idea;
import com.dshbd.domain.Note;
import com.dshbd.domain.Task;
import com.dshbd.repository.BoardRepository;
import com.dshbd.repository.HabitDayScheduleRepository;
import com.dshbd.repository.HabitRepository;
import com.dshbd.repository.HabitSpecificTimeRepository;
import com.dshbd.repository.IdeaRepository;
import com.dshbd.repository.NoteRepository;
import com.dshbd.repository.TaskRepository;
import com.dshbd.service.dto.ImportDataDTO;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ImportService extends BaseService {

    private final Logger log = LoggerFactory.getLogger(ImportService.class);

    private final IdeaRepository ideaRepository;
    private final NoteRepository noteRepository;
    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final HabitDayScheduleRepository habitDayScheduleRepository;
    private final HabitSpecificTimeRepository habitSpecificTimeRepository;

    public ImportService(
        IdeaRepository ideaRepository,
        NoteRepository noteRepository,
        BoardRepository boardRepository,
        TaskRepository taskRepository,
        HabitRepository habitRepository,
        HabitDayScheduleRepository habitDayScheduleRepository,
        HabitSpecificTimeRepository habitSpecificTimeRepository,
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
    }

    @Transactional
    public void importData(ImportDataDTO importData) {
        log.debug("Importing data: {}", importData);

        Long userId = getUserId();
        // Import ideas
        if (importData.getData().getIdeas() != null) {
            importData
                .getData()
                .getIdeas()
                .forEach(ideaDTO -> {
                    Idea idea = new Idea();
                    idea.setContent(ideaDTO.getContent());
                    idea.setCreatedDate(ideaDTO.getCreatedDate());
                    idea.setLastUpdatedDate(ideaDTO.getLastUpdatedDate());
                    idea.setOwnerId(userId);
                    ideaRepository.save(idea);
                });
        }

        // Import notes
        if (importData.getData().getNotes() != null) {
            importData
                .getData()
                .getNotes()
                .forEach(noteDTO -> {
                    Note note = new Note();
                    note.setTitle(noteDTO.getTitle());
                    note.setContent(noteDTO.getContent());
                    note.setCreatedDate(noteDTO.getCreatedDate());
                    note.setLastModifiedDate(noteDTO.getLastModifiedDate());
                    note.setUserId(userId);
                    noteRepository.save(note);
                });
        }

        // Import boards and their tasks
        if (importData.getData().getBoards() != null) {
            importData
                .getData()
                .getBoards()
                .forEach(boardDTO -> {
                    Board board = new Board();
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

                    // Import tasks for this board
                    if (boardDTO.getTasks() != null) {
                        boardDTO
                            .getTasks()
                            .forEach(taskDTO -> {
                                Task task = new Task();
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
                                taskRepository.save(task);
                            });
                    }
                });
        }

        // Import habits and their schedules
        if (importData.getData().getHabits() != null) {
            importData
                .getData()
                .getHabits()
                .forEach(habitDTO -> {
                    Habit habit = new Habit();
                    habit.setName(habitDTO.getName());
                    habit.setDescription(habitDTO.getDescription());
                    habit.setActive(habitDTO.isActive());
                    habit.setScheduleType(Habit.ScheduleType.valueOf(habitDTO.getScheduleType()));
                    habit.setUserId(userId);
                    habit.setCreatedDate(habitDTO.getCreatedDate());
                    habit.setLastModifiedDate(habitDTO.getLastModifiedDate());
                    Habit savedHabit = habitRepository.save(habit);

                    // Import day schedules
                    if (habitDTO.getDaySchedules() != null) {
                        habitDTO
                            .getDaySchedules()
                            .forEach(scheduleDTO -> {
                                HabitDaySchedule daySchedule = new HabitDaySchedule();
                                daySchedule.setDayOfWeek(HabitDaySchedule.DayOfWeek.valueOf(scheduleDTO.getDayOfWeek()));
                                daySchedule.setScheduleType(HabitDaySchedule.ScheduleType.valueOf(scheduleDTO.getScheduleType()));
                                daySchedule.setRepetitions(scheduleDTO.getRepetitions());
                                daySchedule.setHabit(savedHabit);
                                HabitDaySchedule savedSchedule = habitDayScheduleRepository.save(daySchedule);

                                // Import specific times
                                if (scheduleDTO.getSpecificTimes() != null) {
                                    scheduleDTO
                                        .getSpecificTimes()
                                        .forEach(timeDTO -> {
                                            HabitSpecificTime specificTime = new HabitSpecificTime();
                                            specificTime.setHour(timeDTO.getHour());
                                            specificTime.setMinute(timeDTO.getMinute());
                                            specificTime.setDaySchedule(savedSchedule);
                                            habitSpecificTimeRepository.save(specificTime);
                                        });
                                }
                            });
                    }
                });
        }
    }
}
