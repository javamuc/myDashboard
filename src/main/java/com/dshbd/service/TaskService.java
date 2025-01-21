package com.dshbd.service;

import com.dshbd.domain.Task;
import com.dshbd.repository.BoardRepository;
import com.dshbd.repository.TaskRepository;
import com.dshbd.service.dto.TaskDTO;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskService {

    private final Logger log = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final BoardRepository boardRepository;

    public TaskService(TaskRepository taskRepository, BoardRepository boardRepository) {
        this.taskRepository = taskRepository;
        this.boardRepository = boardRepository;
    }

    public Task createTask(TaskDTO taskDTO) {
        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setDueDate(taskDTO.getDueDate());
        task.setCompleted(taskDTO.isCompleted());

        return boardRepository
            .findById(taskDTO.getBoardId())
            .map(board -> {
                task.setBoard(board);
                log.debug("Created Information for Task: {}", task);
                return taskRepository.save(task);
            })
            .orElseThrow(() -> new IllegalStateException("Board could not be found"));
    }

    @Transactional(readOnly = true)
    public List<Task> getBoardTasks(Long boardId) {
        return taskRepository.findByBoardId(boardId);
    }

    @Transactional(readOnly = true)
    public List<Task> getBoardTasksByStatus(Long boardId, boolean completed) {
        return taskRepository.findByBoardIdAndCompleted(boardId, completed);
    }

    @Transactional(readOnly = true)
    public Optional<Task> getTask(Long id) {
        return taskRepository.findById(id);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public Task updateTask(TaskDTO taskDTO) {
        return taskRepository
            .findById(taskDTO.getId())
            .map(task -> {
                task.setTitle(taskDTO.getTitle());
                task.setDescription(taskDTO.getDescription());
                task.setDueDate(taskDTO.getDueDate());
                task.setCompleted(taskDTO.isCompleted());
                return taskRepository.save(task);
            })
            .orElseThrow(() -> new IllegalStateException("Task could not be found"));
    }
}
