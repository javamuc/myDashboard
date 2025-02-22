package com.dshbd.service;

import com.dshbd.domain.Board;
import com.dshbd.domain.Idea;
import com.dshbd.domain.Note;
import com.dshbd.domain.Task;
import com.dshbd.repository.BoardRepository;
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

    public ImportService(
        IdeaRepository ideaRepository,
        NoteRepository noteRepository,
        BoardRepository boardRepository,
        TaskRepository taskRepository,
        UserService userService
    ) {
        super(userService);
        this.ideaRepository = ideaRepository;
        this.noteRepository = noteRepository;
        this.boardRepository = boardRepository;
        this.taskRepository = taskRepository;
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
    }
}
