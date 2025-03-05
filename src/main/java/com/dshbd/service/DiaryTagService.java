package com.dshbd.service;

import com.dshbd.domain.DiaryTag;
import com.dshbd.repository.DiaryEntryRepository;
import com.dshbd.repository.DiaryTagRepository;
import com.dshbd.service.dto.DiaryTagDTO;
import com.dshbd.service.mapper.DiaryTagMapper;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DiaryTagService extends BaseService {

    private final Logger log = LoggerFactory.getLogger(DiaryTagService.class);
    private static final int MAX_ACTIVE_TAGS = 18;

    private final DiaryTagRepository diaryTagRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final DiaryTagMapper diaryTagMapper;

    public DiaryTagService(
        UserService userService,
        DiaryTagRepository diaryTagRepository,
        DiaryEntryRepository diaryEntryRepository,
        DiaryTagMapper diaryTagMapper
    ) {
        super(userService);
        this.diaryTagRepository = diaryTagRepository;
        this.diaryEntryRepository = diaryEntryRepository;
        this.diaryTagMapper = diaryTagMapper;
    }

    public DiaryTagDTO createTag(DiaryTagDTO tagDTO) {
        log.debug("Request to create DiaryTag : {}", tagDTO);

        // Check if user has reached the maximum number of active tags
        long activeTagsCount = diaryTagRepository.countByUserIdAndArchivedFalse(getUserId());
        if (activeTagsCount >= MAX_ACTIVE_TAGS) {
            throw new IllegalStateException("Maximum number of active tags reached");
        }

        // Check if tag with same name already exists for user
        if (diaryTagRepository.existsByUserIdAndNameAndArchivedFalse(getUserId(), tagDTO.getName())) {
            throw new IllegalStateException("Tag with this name already exists: " + tagDTO.getName());
        }

        DiaryTag tag = diaryTagMapper.toEntity(tagDTO);
        tag.setUserId(getUserId());
        tag = diaryTagRepository.save(tag);
        return diaryTagMapper.toDto(tag);
    }

    public DiaryTagDTO updateTag(DiaryTagDTO tagDTO) {
        log.debug("Request to update DiaryTag : {}", tagDTO);
        DiaryTag tag = diaryTagMapper.toEntity(tagDTO);
        tag.setUserId(getUserId());
        tag = diaryTagRepository.save(tag);
        return diaryTagMapper.toDto(tag);
    }

    public DiaryTagDTO getTag(Long id) {
        log.debug("Request to get DiaryTag : {}", id);
        return diaryTagRepository
            .findById(id)
            .map(tag -> {
                if (!tag.getUserId().equals(getUserId())) {
                    throw new IllegalStateException("You are not authorized to access this tag");
                }
                return diaryTagMapper.toDto(tag);
            })
            .orElse(null);
    }

    public List<DiaryTagDTO> getAllTagsByUser() {
        log.debug("Request to get all DiaryTags for user : {}", getUserId());
        return diaryTagRepository.findByUserIdOrderByCreatedDateDesc(getUserId()).stream().map(diaryTagMapper::toDto).toList();
    }

    public List<DiaryTagDTO> getActiveTagsByUser() {
        log.debug("Request to get active DiaryTags for user : {}", getUserId());
        return diaryTagRepository
            .findByUserIdAndArchivedFalseOrderByCreatedDateAsc(getUserId())
            .stream()
            .map(diaryTagMapper::toDto)
            .toList();
    }

    public void deleteTag(Long id) {
        log.debug("Request to delete DiaryTag : {}", id);

        DiaryTag tag = diaryTagRepository
            .findById(id)
            .filter(t -> t.getUserId().equals(getUserId()))
            .orElseThrow(() -> new IllegalStateException("Tag not found or you are not authorized to access it"));

        // Check if tag is used in any entries
        boolean isTagUsed = diaryEntryRepository.existsByTags(tag.getName());
        if (isTagUsed) {
            throw new IllegalStateException(String.format("Cannot delete tag that is used in entries: %s", tag.getName()));
        }
        diaryTagRepository.deleteById(id);
    }

    public DiaryTagDTO archiveTag(Long id) {
        log.debug("Request to archive DiaryTag : {}", id);

        return diaryTagRepository
            .findById(id)
            .filter(t -> t.getUserId().equals(getUserId()))
            .map(tag -> {
                tag.setArchived(true);
                DiaryTag savedTag = diaryTagRepository.save(tag);
                return diaryTagMapper.toDto(savedTag);
            })
            .orElseThrow(() -> new IllegalStateException("Tag not found or you are not authorized to access it"));
    }
}
