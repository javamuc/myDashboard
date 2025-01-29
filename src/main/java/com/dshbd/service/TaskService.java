package com.dshbd.service;

import com.dshbd.domain.Board;
import com.dshbd.domain.Task;
import com.dshbd.repository.BoardRepository;
import com.dshbd.repository.TaskRepository;
import com.dshbd.service.dto.TaskDTO;
import com.dshbd.service.vm.TaskVM;
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
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, BoardRepository boardRepository, UserService userService) {
        this.taskRepository = taskRepository;
        this.boardRepository = boardRepository;
        this.userService = userService;
    }

    public Task createTask(TaskDTO taskDTO) {
        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setDueDate(taskDTO.getDueDate());
        task.setStatus(taskDTO.getStatus());
        task.setPriority(taskDTO.getPriority());
        task.setAssignee(taskDTO.getAssignee());
        task.setBoardId(taskDTO.getBoardId());
        return boardRepository
            .findById(taskDTO.getBoardId())
            .map(board -> {
                task.setBoardId(board.getId());
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
    public List<Task> getBoardTasksByStatus(Long boardId, String status) {
        return taskRepository.findByBoardIdAndStatus(boardId, status);
    }

    @Transactional(readOnly = true)
    public Optional<Task> getTask(Long id) {
        Optional<Task> task = taskRepository.findById(id);
        if (task.isPresent()) {
            List<Long> boardIds = getBoardsIdsForCurrentUser();
            if (boardIds.contains(task.get().getBoardId())) {
                return task;
            }
        }
        throw new IllegalStateException("Task could not be found");
    }

    public void deleteTask(Long id) {
        Optional<Task> task = getTask(id);
        log.info("Task: {}", task);
        if (task.isPresent()) {
            if (task.get().getStatus().equals("backlog")) {
                taskRepository.deleteById(id);
            } else {
                throw new IllegalStateException("Task has already been started");
            }
        } else {
            throw new IllegalStateException("Task could not be found");
        }
    }

    public Task updateTask(TaskDTO taskDTO) {
        Optional<Task> task = getTask(taskDTO.getId());
        if (task.isPresent()) {
            if (!task.get().getStatus().equals("done")) {
                Task taskToUpdate = task.get();
                taskToUpdate.setTitle(taskDTO.getTitle());
                taskToUpdate.setDescription(taskDTO.getDescription());
                taskToUpdate.setDueDate(taskDTO.getDueDate());
                taskToUpdate.setStatus(taskDTO.getStatus());
                taskToUpdate.setPriority(taskDTO.getPriority());
                taskToUpdate.setAssignee(taskDTO.getAssignee());
                return taskRepository.save(taskToUpdate);
            } else {
                throw new IllegalStateException("Task has already been completed");
            }
        } else {
            throw new IllegalStateException("Task could not be found");
        }
    }

    @Transactional(readOnly = true)
    public List<TaskVM> findByStatus(String status) {
        List<Board> boards = getBoardsForCurrentUser();
        List<Long> boardIds = boards.stream().map(Board::getId).toList();
        log.info("Board IDs: {}", boardIds);
        List<Task> tasks = taskRepository.findByBoardIdInAndStatus(boardIds, status);
        log.info("Tasks: {}", tasks);
        //map the tasks to a taskvm
        List<TaskVM> list = tasks.stream().map(task -> new TaskVM(task, getBoardForTask(boards, task))).toList();
        return list;
    }

    private List<Long> getBoardsIdsForCurrentUser() {
        Long userId =
            this.userService.getUserWithAuthorities().orElseThrow(() -> new IllegalStateException("User could not be found")).getId();
        List<Board> boards = boardRepository.findByOwnerId(userId);
        return boards.stream().map(Board::getId).toList();
    }

    private List<Board> getBoardsForCurrentUser() {
        Long userId =
            this.userService.getUserWithAuthorities().orElseThrow(() -> new IllegalStateException("User could not be found")).getId();
        List<Board> boards = boardRepository.findByOwnerId(userId);
        return boards;
    }

    private Board getBoardForTask(List<Board> boards, Task task) {
        return boards
            .stream()
            .filter(e -> e.getId().equals(task.getBoardId()))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Task could not be found"));
    }
}
