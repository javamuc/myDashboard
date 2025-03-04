package com.dshbd.service;

import com.dshbd.domain.DiaryEntry;
import com.dshbd.repository.DiaryEntryRepository;
import com.dshbd.service.dto.DiaryEntryDTO;
import com.dshbd.service.mapper.DiaryEntryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DiaryService extends BaseService {

    private final Logger log = LoggerFactory.getLogger(DiaryService.class);

    private final DiaryEntryRepository diaryEntryRepository;
    private final DiaryEntryMapper diaryEntryMapper;

    public DiaryService(UserService userService, DiaryEntryRepository diaryEntryRepository, DiaryEntryMapper diaryEntryMapper) {
        super(userService);
        this.diaryEntryRepository = diaryEntryRepository;
        this.diaryEntryMapper = diaryEntryMapper;
    }

    public DiaryEntryDTO save(DiaryEntryDTO diaryEntryDTO) {
        log.debug("Request to save DiaryEntry : {}", diaryEntryDTO);
        DiaryEntry diaryEntry = diaryEntryMapper.toEntity(diaryEntryDTO);
        diaryEntry.setUserId(getUserId());
        diaryEntry = diaryEntryRepository.save(diaryEntry);
        return diaryEntryMapper.toDto(diaryEntry);
    }

    @Transactional(readOnly = true)
    public Page<DiaryEntryDTO> findAll(Pageable pageable) {
        log.debug("Request to get all DiaryEntries for current user");
        return diaryEntryRepository.findByUserIdOrderByCreatedDateDesc(getUserId(), pageable).map(diaryEntryMapper::toDto);
    }

    @Transactional(readOnly = true)
    public DiaryEntryDTO findOne(Long id) {
        log.debug("Request to get DiaryEntry : {}", id);
        return diaryEntryRepository
            .findById(id)
            .map(diaryEntry -> {
                if (!diaryEntry.getUserId().equals(getUserId())) {
                    throw new IllegalStateException("You are not authorized to access this diary entry");
                }
                return diaryEntryMapper.toDto(diaryEntry);
            })
            .orElse(null);
    }

    public void delete(Long id) {
        log.debug("Request to delete DiaryEntry : {}", id);
        diaryEntryRepository.deleteByUserIdAndId(getUserId(), id);
    }
}
