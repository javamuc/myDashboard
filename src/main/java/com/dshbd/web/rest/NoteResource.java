package com.dshbd.web.rest;

import com.dshbd.service.NoteService;
import com.dshbd.service.dto.NoteDTO;
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
public class NoteResource {

    private final Logger log = LoggerFactory.getLogger(NoteResource.class);

    private static final String ENTITY_NAME = "note";

    private final NoteService noteService;

    public NoteResource(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping("/notes")
    public ResponseEntity<List<NoteDTO>> getAllNotes() {
        log.debug("REST request to get all Notes for current user");
        List<NoteDTO> notes = noteService.findAllByCurrentUser();
        return ResponseEntity.ok(notes);
    }

    @GetMapping("/notes/{id}")
    public ResponseEntity<NoteDTO> getNote(@PathVariable Long id) {
        log.debug("REST request to get Note : {}", id);
        return ResponseUtil.wrapOrNotFound(noteService.findOne(id));
    }

    @PostMapping("/notes")
    public ResponseEntity<NoteDTO> createNote(@Valid @RequestBody NoteVM noteVM) throws URISyntaxException {
        log.debug("REST request to save Note : {}", noteVM);

        NoteDTO result = noteService.createNote(noteVM.getTitle(), noteVM.getContent());
        return ResponseEntity.created(new URI("/api/notes/" + result.getId())).body(result);
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<NoteDTO> updateNote(@PathVariable Long id, @Valid @RequestBody NoteDTO noteDTO) {
        log.debug("REST request to update Note : {}", noteDTO);
        if (noteDTO.getId() == null || !noteDTO.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }

        NoteDTO result = noteService.save(noteDTO);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        log.debug("REST request to delete Note : {}", id);
        noteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
