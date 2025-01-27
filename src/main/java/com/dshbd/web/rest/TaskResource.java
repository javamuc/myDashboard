package com.dshbd.web.rest;

import com.dshbd.domain.Task;
import com.dshbd.service.TaskService;
import com.dshbd.service.dto.TaskDTO;
import com.dshbd.service.vm.TaskVM;
import com.dshbd.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class TaskResource {

    private final Logger log = LoggerFactory.getLogger(TaskResource.class);

    private static final String ENTITY_NAME = "task";

    private final TaskService taskService;

    public TaskResource(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/tasks")
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskDTO taskDTO) throws URISyntaxException {
        log.debug("REST request to save Task : {}", taskDTO);
        if (taskDTO.getId() != null) {
            throw new BadRequestAlertException("A new task cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Task result = taskService.createTask(taskDTO);
        return ResponseEntity.created(new URI("/api/tasks/" + result.getId())).body(result);
    }

    @PutMapping("/tasks")
    public ResponseEntity<Task> updateTask(@Valid @RequestBody TaskDTO taskDTO) {
        log.debug("REST request to update Task : {}", taskDTO);
        if (taskDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Task result = taskService.updateTask(taskDTO);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/boards/{boardId}/tasks")
    public List<Task> getBoardTasks(@PathVariable Long boardId) {
        log.debug("REST request to get all Tasks for Board : {}", boardId);
        return taskService.getBoardTasks(boardId);
    }

    @GetMapping("/boards/{boardId}/tasks/status")
    public List<Task> getBoardTasksByStatus(@PathVariable Long boardId, @RequestParam String status) {
        log.debug("REST request to get Tasks by status for Board : {}", boardId);
        return taskService.getBoardTasksByStatus(boardId, status);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Long id) {
        log.debug("REST request to get Task : {}", id);
        return ResponseUtil.wrapOrNotFound(taskService.getTask(id));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.debug("REST request to delete Task : {}", id);
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tasks/status/{status}")
    public List<TaskVM> getTasksByStatus(@PathVariable String status) {
        log.debug("REST request to get Tasks by status : {}", status);
        return taskService.findByStatus(status);
    }
}
