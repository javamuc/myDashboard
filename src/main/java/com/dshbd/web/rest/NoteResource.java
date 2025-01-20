package com.dshbd.web.rest;

import com.dshbd.domain.Note;
import com.dshbd.domain.User;
import com.dshbd.repository.NoteRepository;
import com.dshbd.repository.UserRepository;
import com.dshbd.security.SecurityUtils;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class NoteResource {

    private final Logger log = LoggerFactory.getLogger(NoteResource.class);
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteResource(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/notes")
    public ResponseEntity<List<Note>> getAllNotes() {
        log.debug("REST request to get all Notes for current user");
        Optional<String> userLogin = SecurityUtils.getCurrentUserLogin();
        if (userLogin.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> user = userRepository.findOneByLogin(userLogin.get());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(noteRepository.findByUserIdOrderByLastModifiedDateDesc(user.get().getId()));
    }

    @GetMapping("/notes/{id}")
    public ResponseEntity<Note> getNote(@PathVariable Long id) {
        log.debug("REST request to get Note : {}", id);
        Optional<Note> note = noteRepository.findById(id);
        return note.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/notes")
    public ResponseEntity<Note> createNote(@Valid @RequestBody NoteVM noteVM) throws URISyntaxException {
        log.debug("REST request to save Note : {}", noteVM);

        Optional<String> userLogin = SecurityUtils.getCurrentUserLogin();
        if (userLogin.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Optional<User> user = userRepository.findOneByLogin(userLogin.get());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Note note = new Note();
        note.setTitle(noteVM.getTitle());
        note.setContent(noteVM.getContent());
        note.setUser(user.get());
        Note result = noteRepository.save(note);
        return ResponseEntity.created(new URI("/api/notes/" + result.getId())).body(result);
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @Valid @RequestBody Note note) {
        log.debug("REST request to update Note : {}", note);
        if (note.getId() == null || !note.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Note> existingNote = noteRepository.findById(id);
        if (existingNote.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Check if the note belongs to the current user
        if (!existingNote.get().getUser().getLogin().equals(SecurityUtils.getCurrentUserLogin().get())) {
            return ResponseEntity.status(403).build();
        }
        existingNote.get().setLastModifiedDate(Instant.now());
        existingNote.get().setTitle(note.getTitle());
        existingNote.get().setContent(note.getContent());
        Note result = noteRepository.save(existingNote.get());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        log.debug("REST request to delete Note : {}", id);
        Optional<Note> existingNote = noteRepository.findById(id);
        if (existingNote.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Check if the note belongs to the current user
        if (!existingNote.get().getUser().getLogin().equals(SecurityUtils.getCurrentUserLogin().get())) {
            return ResponseEntity.status(403).build();
        }

        noteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
