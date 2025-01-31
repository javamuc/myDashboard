package com.dshbd.web.rest;

import com.dshbd.service.HabitRecordService;
import com.dshbd.service.dto.HabitRecordDTO;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/habit-records")
public class HabitRecordResource {

    private final Logger log = LoggerFactory.getLogger(HabitRecordResource.class);

    private final HabitRecordService habitRecordService;

    public HabitRecordResource(HabitRecordService habitRecordService) {
        this.habitRecordService = habitRecordService;
    }

    /**
     * {@code POST  /habit-records} : Create a new habit record.
     *
     * @param habitRecordDTO the habit record to create
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new habitRecordDTO
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping
    public ResponseEntity<HabitRecordDTO> createHabitRecord(@Valid @RequestBody HabitRecordDTO habitRecordDTO) throws URISyntaxException {
        log.debug("REST request to save HabitRecord : {}", habitRecordDTO);
        HabitRecordDTO result = habitRecordService.create(habitRecordDTO);
        return ResponseEntity.created(new URI("/api/habit-records/" + result.getId())).body(result);
    }

    /**
     * {@code GET  /habit-records/date/:date} : get all habit records for the current user for a specific date.
     *
     * @param date the date to get records for
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of habit records in body
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<List<HabitRecordDTO>> getAllForDate(@PathVariable LocalDate date) {
        log.debug("REST request to get all HabitRecords for date : {}", date);
        List<HabitRecordDTO> result = habitRecordService.getAllForUserAndDate(date);
        return ResponseEntity.ok().body(result);
    }

    /**
     * {@code GET  /habit-records/month/:year/:month} : get all habit records for the current user for a specific month.
     *
     * @param year the year
     * @param month the month (1-12)
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of habit records in body
     */
    @GetMapping("/month/{year}/{month}")
    public ResponseEntity<List<HabitRecordDTO>> getAllForMonth(@PathVariable int year, @PathVariable int month) {
        log.debug("REST request to get all HabitRecords for year : {} and month : {}", year, month);
        YearMonth yearMonth = YearMonth.of(year, month);
        List<HabitRecordDTO> result = habitRecordService.getAllForUserAndMonth(yearMonth);
        return ResponseEntity.ok().body(result);
    }
}
