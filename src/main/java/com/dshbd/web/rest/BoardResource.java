package com.dshbd.web.rest;

import com.dshbd.domain.Board;
import com.dshbd.service.BoardService;
import com.dshbd.service.dto.BoardDTO;
import com.dshbd.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class BoardResource {

    private final Logger log = LoggerFactory.getLogger(BoardResource.class);

    private static final String ENTITY_NAME = "board";

    private final BoardService boardService;

    public BoardResource(BoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping("/boards")
    public ResponseEntity<Board> createBoard(@Valid @RequestBody BoardDTO boardDTO) throws URISyntaxException {
        log.debug("REST request to save Board : {}", boardDTO);
        if (boardDTO.getId() != null) {
            throw new BadRequestAlertException("A new board cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Board result = boardService.createBoard(boardDTO);
        return ResponseEntity.created(new URI("/api/boards/" + result.getId())).body(result);
    }

    @PutMapping("/boards")
    public ResponseEntity<Board> updateBoard(@Valid @RequestBody BoardDTO boardDTO) {
        log.debug("REST request to update Board : {}", boardDTO);
        if (boardDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Board result = boardService.updateBoard(boardDTO);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/boards")
    public List<Board> getAllBoards() {
        log.debug("REST request to get all Boards for current user");
        return boardService.getCurrentUserBoards();
    }

    @GetMapping("/boards/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable Long id) {
        log.debug("REST request to get Board : {}", id);
        return ResponseUtil.wrapOrNotFound(boardService.getBoard(id));
    }

    @DeleteMapping("/boards/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        log.debug("REST request to delete Board : {}", id);
        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}
