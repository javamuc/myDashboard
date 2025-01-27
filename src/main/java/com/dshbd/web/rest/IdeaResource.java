package com.dshbd.web.rest;

import com.dshbd.domain.Idea;
import com.dshbd.service.IdeaService;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class IdeaResource {

    private final Logger log = LoggerFactory.getLogger(IdeaResource.class);

    private final IdeaService ideaService;

    public IdeaResource(IdeaService ideaService) {
        this.ideaService = ideaService;
    }

    @PostMapping("/ideas")
    public ResponseEntity<Idea> createIdea(@Valid @RequestBody Idea idea) throws URISyntaxException {
        log.debug("REST request to save Idea : {}", idea);
        if (idea.getId() != null) {
            return ResponseEntity.badRequest().build();
        }
        Idea result = ideaService.save(idea);
        return ResponseEntity.created(new URI("/api/ideas/" + result.getId())).body(result);
    }

    @PutMapping("/ideas/{id}")
    public ResponseEntity<Idea> updateIdea(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Idea idea)
        throws URISyntaxException {
        log.debug("REST request to update Idea : {}, {}", id, idea);
        if (idea.getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!id.equals(idea.getId())) {
            return ResponseEntity.badRequest().build();
        }

        Idea result = ideaService.save(idea);
        return ResponseEntity.ok().body(result);
    }

    @PatchMapping("/ideas/{id}")
    public ResponseEntity<Idea> partialUpdateIdea(@PathVariable(value = "id", required = false) final Long id, @RequestBody Idea idea)
        throws URISyntaxException {
        log.debug("REST request to partially update Idea : {}, {}", id, idea);
        if (idea.getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!id.equals(idea.getId())) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Idea> result = ideaService.partialUpdate(idea);

        return result.map(response -> ResponseEntity.ok().body(response)).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ideas")
    public List<Idea> getAllIdeas() {
        log.debug("REST request to get all Ideas");
        return ideaService.findAll();
    }

    @GetMapping("/ideas/{id}")
    public ResponseEntity<Idea> getIdea(@PathVariable Long id) {
        log.debug("REST request to get Idea : {}", id);
        Optional<Idea> idea = ideaService.findOne(id);
        return idea.map(response -> ResponseEntity.ok().body(response)).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/ideas/{id}")
    public ResponseEntity<Void> deleteIdea(@PathVariable Long id) {
        log.debug("REST request to delete Idea : {}", id);
        ideaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
