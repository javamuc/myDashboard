package com.dshbd.web.rest;

import com.dshbd.service.HabitService;
import com.dshbd.service.dto.HabitDTO;
import com.dshbd.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.dshbd.domain.Habit}.
 */
@RestController
@RequestMapping("/api")
public class HabitResource {

    private final Logger log = LoggerFactory.getLogger(HabitResource.class);

    private static final String ENTITY_NAME = "habit";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HabitService habitService;

    public HabitResource(HabitService habitService) {
        this.habitService = habitService;
    }

    /**
     * {@code POST  /habits} : Create a new habit.
     *
     * @param habitDTO the habit to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new habit, or with status {@code 400 (Bad Request)} if the habit has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/habits")
    public ResponseEntity<HabitDTO> createHabit(@Valid @RequestBody HabitDTO habitDTO) throws URISyntaxException {
        log.debug("REST request to save Habit : {}", habitDTO);
        if (habitDTO.getId() != null) {
            throw new BadRequestAlertException("A new habit cannot already have an ID", ENTITY_NAME, "idexists");
        }
        HabitDTO result = habitService.save(habitDTO);
        return ResponseEntity.created(new URI("/api/habits/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /habits/:id} : Updates an existing habit.
     *
     * @param id the id of the habit to save.
     * @param habitDTO the habit to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated habit,
     * or with status {@code 400 (Bad Request)} if the habit is not valid,
     * or with status {@code 500 (Internal Server Error)} if the habit couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/habits/{id}")
    public ResponseEntity<HabitDTO> updateHabit(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody HabitDTO habitDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Habit : {}, {}", id, habitDTO);
        if (habitDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, habitDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!habitService.findOne(id).isPresent()) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        HabitDTO result = habitService.update(habitDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, habitDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /habits} : get all the habits.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of habits in body.
     */
    @GetMapping("/habits")
    public List<HabitDTO> getAllHabits() {
        log.debug("REST request to get all Habits");
        return habitService.findAll();
    }

    /**
     * {@code GET  /habits/active} : get all active habits.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of active habits in body.
     */
    @GetMapping("/habits/active")
    public List<HabitDTO> getAllActiveHabits() {
        log.debug("REST request to get all active Habits");
        return habitService.findAllActive();
    }

    /**
     * {@code GET  /habits/:id} : get the "id" habit.
     *
     * @param id the id of the habit to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the habit, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/habits/{id}")
    public ResponseEntity<HabitDTO> getHabit(@PathVariable Long id) {
        log.debug("REST request to get Habit : {}", id);
        Optional<HabitDTO> habitDTO = habitService.findOne(id);
        return ResponseUtil.wrapOrNotFound(habitDTO);
    }

    /**
     * {@code DELETE  /habits/:id} : delete the "id" habit.
     *
     * @param id the id of the habit to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/habits/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id) {
        log.debug("REST request to delete Habit : {}", id);
        habitService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
