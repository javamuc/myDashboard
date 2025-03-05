package com.dshbd.web.rest;

import com.dshbd.service.DiaryService;
import com.dshbd.service.dto.DiaryEntryDTO;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DiaryResource {

    private final Logger log = LoggerFactory.getLogger(DiaryResource.class);
    private final DiaryService diaryService;

    public DiaryResource(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @PostMapping("/diary-entries")
    public ResponseEntity<DiaryEntryDTO> createDiaryEntry(@Valid @RequestBody DiaryEntryDTO diaryEntryDTO) throws URISyntaxException {
        log.debug("REST request to save DiaryEntry : {}", diaryEntryDTO);
        if (diaryEntryDTO.getId() != null) {
            return ResponseEntity.badRequest().build();
        }
        DiaryEntryDTO result = diaryService.save(diaryEntryDTO);
        return ResponseEntity.created(new URI("/api/diary-entries/" + result.getId())).body(result);
    }

    @PutMapping("/diary-entries/{id}")
    public ResponseEntity<DiaryEntryDTO> updateDiaryEntry(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DiaryEntryDTO diaryEntryDTO
    ) {
        log.debug("REST request to update DiaryEntry : {}, {}", id, diaryEntryDTO);
        if (diaryEntryDTO.getId() == null || !id.equals(diaryEntryDTO.getId())) {
            return ResponseEntity.badRequest().build();
        }
        DiaryEntryDTO result = diaryService.save(diaryEntryDTO);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/diary-entries")
    public ResponseEntity<Page<DiaryEntryDTO>> getAllDiaryEntries(Pageable pageable) {
        log.debug("REST request to get a page of DiaryEntries");
        Page<DiaryEntryDTO> page = diaryService.findAll(pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping("/diary-entries/{id}")
    public ResponseEntity<DiaryEntryDTO> getDiaryEntry(@PathVariable Long id) {
        log.debug("REST request to get DiaryEntry : {}", id);
        DiaryEntryDTO diaryEntryDTO = diaryService.findOne(id);
        return ResponseEntity.ok().body(diaryEntryDTO);
    }

    @DeleteMapping("/diary-entries/{id}")
    public ResponseEntity<Void> deleteDiaryEntry(@PathVariable Long id) {
        log.debug("REST request to delete DiaryEntry : {}", id);
        diaryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * {@code DELETE  /diary-entries/all} : Delete all diary entries.
     * Only accessible by administrators.
     *
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/diary-entries/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAllEntries() {
        log.debug("REST request to delete all DiaryEntries");
        diaryService.deleteAllEntries();
        return ResponseEntity.noContent().build();
    }
}
