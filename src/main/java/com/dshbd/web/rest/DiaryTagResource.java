package com.dshbd.web.rest;

import com.dshbd.service.DiaryTagService;
import com.dshbd.service.dto.DiaryTagDTO;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DiaryTagResource {

    private final Logger log = LoggerFactory.getLogger(DiaryTagResource.class);
    private final DiaryTagService diaryTagService;

    public DiaryTagResource(DiaryTagService diaryTagService) {
        this.diaryTagService = diaryTagService;
    }

    @PostMapping("/diary-tags")
    public ResponseEntity<DiaryTagDTO> createDiaryTag(@Valid @RequestBody DiaryTagDTO diaryTagDTO) throws URISyntaxException {
        log.debug("REST request to save DiaryTag : {}", diaryTagDTO);
        if (diaryTagDTO.getId() != null) {
            return ResponseEntity.badRequest().build();
        }
        DiaryTagDTO result = diaryTagService.createTag(diaryTagDTO);
        return ResponseEntity.created(new URI("/api/diary-tags/" + result.getId())).body(result);
    }

    @PutMapping("/diary-tags/{id}")
    public ResponseEntity<DiaryTagDTO> updateDiaryTag(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DiaryTagDTO diaryTagDTO
    ) {
        log.debug("REST request to update DiaryTag : {}, {}", id, diaryTagDTO);
        if (diaryTagDTO.getId() == null || !id.equals(diaryTagDTO.getId())) {
            return ResponseEntity.badRequest().build();
        }
        DiaryTagDTO result = diaryTagService.updateTag(diaryTagDTO);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/diary-tags")
    public ResponseEntity<List<DiaryTagDTO>> getAllDiaryTags() {
        log.debug("REST request to get all DiaryTags");
        List<DiaryTagDTO> tags = diaryTagService.getAllTagsByUser();
        return ResponseEntity.ok().body(tags);
    }

    @GetMapping("/diary-tags/active")
    public ResponseEntity<List<DiaryTagDTO>> getActiveDiaryTags() {
        log.debug("REST request to get active DiaryTags");
        List<DiaryTagDTO> tags = diaryTagService.getActiveTagsByUser();
        return ResponseEntity.ok().body(tags);
    }

    @GetMapping("/diary-tags/{id}")
    public ResponseEntity<DiaryTagDTO> getDiaryTag(@PathVariable Long id) {
        log.debug("REST request to get DiaryTag : {}", id);
        DiaryTagDTO diaryTagDTO = diaryTagService.getTag(id);
        return ResponseEntity.ok().body(diaryTagDTO);
    }

    @DeleteMapping("/diary-tags/{id}")
    public ResponseEntity<Void> deleteDiaryTag(@PathVariable Long id) {
        log.debug("REST request to delete DiaryTag : {}", id);
        diaryTagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/diary-tags/{id}/archive")
    public ResponseEntity<DiaryTagDTO> archiveDiaryTag(@PathVariable Long id) {
        log.debug("REST request to archive DiaryTag : {}", id);
        DiaryTagDTO result = diaryTagService.archiveTag(id);
        return ResponseEntity.ok().body(result);
    }
}
