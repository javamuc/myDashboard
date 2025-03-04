package com.dshbd.service;

import com.dshbd.domain.Note;
import com.dshbd.repository.NoteRepository;
import com.dshbd.repository.UserRepository;
import com.dshbd.service.dto.NoteDTO;
import com.dshbd.service.mapper.NoteMapper;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NoteService extends BaseService {

    private final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;

    public NoteService(NoteRepository noteRepository, UserRepository userRepository, NoteMapper noteMapper, UserService userService) {
        super(userService);
        this.noteRepository = noteRepository;
        this.noteMapper = noteMapper;
    }

    public NoteDTO createNote(String title, String content) {
        Note note = new Note();
        note.setTitle(title);
        note.setContent(content);
        note.setUserId(getUserId());
        Note savedNote = noteRepository.saveAndFlush(note);
        log.debug("Saved Note: {}", savedNote);
        return noteMapper.toDto(savedNote);
    }

    public NoteDTO save(NoteDTO noteDTO) {
        log.debug("Request to save Note : {}", noteDTO);

        Note note;
        if (noteDTO.getId() != null) {
            // Update existing note
            Optional<Note> existingNote = noteRepository.findById(noteDTO.getId());
            if (existingNote.isEmpty() || !existingNote.get().getUserId().equals(getUserId())) {
                throw new IllegalStateException("Note not found or not owned by current user");
            }
            note = existingNote.get();
            note.setTitle(noteDTO.getTitle());
            note.setContent(noteDTO.getContent());
        } else {
            // Create new note
            note = noteMapper.toEntity(noteDTO);
            note.setUserId(getUserId());
        }

        note = noteRepository.save(note);
        return noteMapper.toDto(note);
    }

    @Transactional(readOnly = true)
    public List<NoteDTO> findAllByCurrentUser() {
        log.debug("Request to get all Notes for current user");

        return noteRepository.findByUserIdOrderByLastModifiedDateDesc(getUserId()).stream().map(noteMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<NoteDTO> findOne(Long id) {
        log.debug("Request to get Note : {}", id);

        return noteRepository.findById(id).filter(note -> note.getUserId().equals(getUserId())).map(noteMapper::toDto);
    }

    public void delete(Long id) {
        log.debug("Request to delete Note : {}", id);

        Optional<Note> note = noteRepository.findById(id);
        if (note.isPresent() && note.get().getUserId().equals(getUserId())) {
            noteRepository.deleteById(id);
        } else {
            throw new IllegalStateException("Note not found or not owned by current user");
        }
    }
}
