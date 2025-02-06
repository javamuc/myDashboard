package com.dshbd.service;

import com.dshbd.domain.Note;
import com.dshbd.domain.User;
import com.dshbd.repository.NoteRepository;
import com.dshbd.repository.UserRepository;
import com.dshbd.security.SecurityUtils;
import com.dshbd.service.dto.NoteDTO;
import com.dshbd.service.mapper.NoteMapper;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NoteService {

    private final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final NoteMapper noteMapper;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository, NoteMapper noteMapper) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.noteMapper = noteMapper;
    }

    public Note createNote(NoteDTO noteDTO) {
        Note note = new Note();
        note.setTitle(noteDTO.getTitle());
        note.setContent(noteDTO.getContent());
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            throw new IllegalStateException("Current user not found");
        }
        note.setUserId(currentUser.get().getId());
        return noteRepository.save(note);
    }

    public NoteDTO save(NoteDTO noteDTO) {
        log.debug("Request to save Note : {}", noteDTO);
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            throw new IllegalStateException("Current user not found");
        }

        Note note = noteMapper.toEntity(noteDTO);
        note.setUserId(currentUser.get().getId());
        return noteMapper.toDto(noteRepository.save(note));
    }

    @Transactional(readOnly = true)
    public List<NoteDTO> findAllByCurrentUser() {
        log.debug("Request to get all Notes for current user");
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            throw new IllegalStateException("Current user not found");
        }

        return noteRepository.findByUserIdOrderByLastModifiedDateDesc(currentUser.get().getId()).stream().map(noteMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<NoteDTO> findOne(Long id) {
        log.debug("Request to get Note : {}", id);
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            throw new IllegalStateException("Current user not found");
        }

        return noteRepository.findById(id).filter(note -> note.getUserId().equals(currentUser.get().getId())).map(noteMapper::toDto);
    }

    public void delete(Long id) {
        log.debug("Request to delete Note : {}", id);
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            throw new IllegalStateException("Current user not found");
        }

        Optional<Note> note = noteRepository.findById(id);
        if (note.isPresent() && note.get().getUserId().equals(currentUser.get().getId())) {
            noteRepository.deleteById(id);
        } else {
            throw new IllegalStateException("Note not found or not owned by current user");
        }
    }

    private Optional<User> getCurrentUser() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneByLogin);
    }
}
