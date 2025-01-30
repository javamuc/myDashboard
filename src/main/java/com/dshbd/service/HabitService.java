package com.dshbd.service;

import com.dshbd.domain.Habit;
import com.dshbd.domain.User;
import com.dshbd.repository.HabitRepository;
import com.dshbd.security.SecurityUtils;
import com.dshbd.service.dto.HabitDTO;
import com.dshbd.service.mapper.HabitMapper;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for managing habits.
 */
@Service
@Transactional
public class HabitService {

    private final Logger log = LoggerFactory.getLogger(HabitService.class);

    private final HabitRepository habitRepository;
    private final UserService userService;
    private final HabitMapper habitMapper;

    public HabitService(HabitRepository habitRepository, UserService userService, HabitMapper habitMapper) {
        this.habitRepository = habitRepository;
        this.userService = userService;
        this.habitMapper = habitMapper;
    }

    /**
     * Save a habit.
     *
     * @param habitDTO the entity to save.
     * @return the persisted entity.
     */
    public HabitDTO save(HabitDTO habitDTO) {
        log.debug("Request to save Habit : {}", habitDTO);
        Optional<User> user = userService.getUserWithAuthorities();
        if (user.isPresent()) {
            Habit habit = habitMapper.toEntity(habitDTO, user.get());
            habit = habitRepository.save(habit);
            return habitMapper.toDto(habit);
        }
        throw new IllegalStateException("User not found");
    }

    /**
     * Update a habit.
     *
     * @param habitDTO the entity to update.
     * @return the persisted entity.
     */
    public HabitDTO update(HabitDTO habitDTO) {
        log.debug("Request to update Habit : {}", habitDTO);
        Optional<User> user = userService.getUserWithAuthorities();
        if (user.isPresent()) {
            Habit habit = habitMapper.toEntity(habitDTO, user.get());
            habit = habitRepository.save(habit);
            return habitMapper.toDto(habit);
        }
        throw new IllegalStateException("User not found");
    }

    /**
     * Get all the habits for current user.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<HabitDTO> findAll() {
        log.debug("Request to get all Habits for current user");
        return userService
            .getUserWithAuthorities()
            .map(user ->
                habitRepository.findByUserOrderByCreatedDateDesc(user).stream().map(habitMapper::toDto).collect(Collectors.toList())
            )
            .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    /**
     * Get all active habits for current user.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<HabitDTO> findAllActive() {
        log.debug("Request to get all active Habits for current user");
        return userService
            .getUserWithAuthorities()
            .map(user ->
                habitRepository
                    .findByUserAndActiveIsTrueOrderByCreatedDateDesc(user)
                    .stream()
                    .map(habitMapper::toDto)
                    .collect(Collectors.toList())
            )
            .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    /**
     * Get one habit by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<HabitDTO> findOne(Long id) {
        log.debug("Request to get Habit : {}", id);
        return userService
            .getUserWithAuthorities()
            .flatMap(user -> habitRepository.findById(id).filter(habit -> habit.getUser().equals(user)).map(habitMapper::toDto));
    }

    /**
     * Delete the habit by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Habit : {}", id);
        userService.getUserWithAuthorities().ifPresent(user -> habitRepository.deleteByIdAndUser(id, user));
    }
}
