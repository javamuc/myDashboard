package com.dshbd.service;

import com.dshbd.domain.Idea;
import com.dshbd.repository.IdeaRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class IdeaService {

    private final Logger log = LoggerFactory.getLogger(IdeaService.class);

    private final IdeaRepository ideaRepository;
    private final UserService userService;

    public IdeaService(IdeaRepository ideaRepository, UserService userService) {
        this.ideaRepository = ideaRepository;
        this.userService = userService;
    }

    public Idea save(Idea idea) {
        log.debug("Request to save Idea : {}", idea);
        return userService
            .getUserWithAuthorities()
            .map(user -> {
                idea.setOwnerId(user.getId());
                return ideaRepository.save(idea);
            })
            .orElseThrow(() -> new IllegalStateException("User could not be found"));
    }

    public Optional<Idea> partialUpdate(Idea idea) {
        log.debug("Request to partially update Idea : {}", idea);

        return ideaRepository
            .findById(idea.getId())
            .map(existingIdea -> {
                if (idea.getContent() != null) {
                    existingIdea.setContent(idea.getContent());
                }
                return existingIdea;
            })
            .map(ideaRepository::save);
    }

    @Transactional(readOnly = true)
    public List<Idea> findAll() {
        log.debug("Request to get all Ideas");
        return ideaRepository.findByOwnerId(
            userService.getUserWithAuthorities().orElseThrow(() -> new IllegalStateException("User could not be found")).getId()
        );
    }

    @Transactional(readOnly = true)
    public Optional<Idea> findOne(Long id) {
        log.debug("Request to get Idea : {}", id);
        return ideaRepository.findById(id);
    }

    public void delete(Long id) {
        log.debug("Request to delete Idea : {}", id);
        ideaRepository.deleteById(id);
    }
}
