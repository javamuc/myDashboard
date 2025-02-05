package com.dshbd.service;

import com.dshbd.domain.HabitRecord;
import com.dshbd.repository.HabitRecordRepository;
import com.dshbd.repository.HabitRepository;
import com.dshbd.repository.UserRepository;
import com.dshbd.security.SecurityUtils;
import com.dshbd.service.dto.HabitRecordDTO;
import com.dshbd.service.mapper.HabitRecordMapper;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HabitRecordService {

    private final Logger log = LoggerFactory.getLogger(HabitRecordService.class);

    private final HabitRecordRepository habitRecordRepository;
    private final UserRepository userRepository;
    private final HabitRecordMapper habitRecordMapper;

    public HabitRecordService(
        HabitRecordRepository habitRecordRepository,
        HabitRepository habitRepository,
        UserRepository userRepository,
        HabitRecordMapper habitRecordMapper
    ) {
        this.habitRecordRepository = habitRecordRepository;
        this.userRepository = userRepository;
        this.habitRecordMapper = habitRecordMapper;
    }

    /**
     * Create a new habit record.
     *
     * @param habitRecordDTO the habit record to create
     * @return the created habit record
     */
    public HabitRecordDTO create(HabitRecordDTO habitRecordDTO) {
        log.debug("Request to create HabitRecord : {}", habitRecordDTO);

        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .map(user -> {
                HabitRecord habitRecord = habitRecordMapper.toEntity(habitRecordDTO);
                habitRecord.setUserId(user.getId());
                habitRecord.setRecordDate(LocalDate.now());
                return habitRecordMapper.toDto(habitRecordRepository.save(habitRecord));
            })
            .orElseThrow(() -> new IllegalStateException("User could not be found"));
    }

    /**
     * Get all habit records for the current user for a specific date.
     *
     * @param date the date to get records for
     * @return the list of habit records
     */
    @Transactional(readOnly = true)
    public List<HabitRecordDTO> getAllForUserAndDate(LocalDate date) {
        log.debug("Request to get all HabitRecords for user and date : {}", date);

        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .map(user -> habitRecordRepository.findAllByUserIdAndRecordDate(user.getId(), date))
            .map(habitRecordMapper::toDto)
            .orElseThrow(() -> new IllegalStateException("User could not be found"));
    }

    /**
     * Get all habit records for the current user for a specific month.
     *
     * @param yearMonth the year and month to get records for
     * @return the list of habit records
     */
    @Transactional(readOnly = true)
    public List<HabitRecordDTO> getAllForUserAndMonth(YearMonth yearMonth) {
        log.debug("Request to get all HabitRecords for user and month : {}", yearMonth);

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .map(user -> habitRecordRepository.findAllByUserIdAndRecordDateBetween(user.getId(), startDate, endDate))
            .map(habitRecordMapper::toDto)
            .orElseThrow(() -> new IllegalStateException("User could not be found"));
    }
}
