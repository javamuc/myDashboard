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
public class IdeaService extends BaseService<Idea, Long> {

    private final Logger log = LoggerFactory.getLogger(IdeaService.class);

    private final IdeaRepository ideaRepository;

    public IdeaService(IdeaRepository ideaRepository, UserService userService) {
        super(userService);
        this.ideaRepository = ideaRepository;
    }

    public Idea save(Idea idea) {
        idea.setOwnerId(getUserId());
        log.debug("Request to save Idea : {}", idea);
        return ideaRepository.save(idea);
    }

    public Optional<Idea> partialUpdate(Idea idea) {
        log.debug("Request to partially update Idea : {}", idea);

        return ideaRepository
            .findByIdAndOwnerId(idea.getId(), getUserId())
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
        return ideaRepository.findByOwnerId(getUserId());
    }

    @Transactional(readOnly = true)
    public Optional<Idea> findOne(Long id) {
        log.debug("Request to get Idea : {}", id);
        return ideaRepository.findByIdAndOwnerId(id, getUserId());
    }

    public void delete(Long id) {
        log.debug("Request to delete Idea : {}", id);
        int deletedCount = ideaRepository.deleteByIdAndOwnerId(id, getUserId());
        if (deletedCount == 0) {
            log.error("Idea with id {} not found", id);
        }
    }
}
