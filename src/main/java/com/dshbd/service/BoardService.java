package com.dshbd.service;

import com.dshbd.domain.Board;
import com.dshbd.repository.BoardRepository;
import com.dshbd.security.SecurityUtils;
import com.dshbd.service.dto.BoardDTO;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BoardService {

    private final Logger log = LoggerFactory.getLogger(BoardService.class);

    private final BoardRepository boardRepository;
    private final UserService userService;

    public BoardService(BoardRepository boardRepository, UserService userService) {
        this.boardRepository = boardRepository;
        this.userService = userService;
    }

    public Board createBoard(BoardDTO boardDTO) {
        Board board = new Board();
        board.setTitle(boardDTO.getTitle());
        board.setDescription(boardDTO.getDescription());

        return userService
            .getUserWithAuthorities()
            .map(user -> {
                board.setOwner(user);
                log.debug("Created Information for Board: {}", board);
                return boardRepository.save(board);
            })
            .orElseThrow(() -> new IllegalStateException("User could not be found"));
    }

    @Transactional(readOnly = true)
    public List<Board> getCurrentUserBoards() {
        List<Board> boards = SecurityUtils.getCurrentUserLogin()
            .map(boardRepository::findByOwnerLogin)
            .orElseThrow(() -> new IllegalStateException("User could not be found"));

        if (boards.isEmpty()) {
            Board board = new Board();

            board.setTitle("Life Board");
            board.setDescription("Default Board");
            board.setOwner(userService.getUserWithAuthorities().orElseThrow(() -> new IllegalStateException("User could not be found")));
            boards.add(boardRepository.save(board));
        }
        return boards;
    }

    @Transactional(readOnly = true)
    public Optional<Board> getBoard(Long id) {
        return boardRepository.findById(id);
    }

    public void deleteBoard(Long id) {
        boardRepository.deleteById(id);
    }

    public Board updateBoard(BoardDTO boardDTO) {
        return boardRepository
            .findById(boardDTO.getId())
            .map(board -> {
                board.setTitle(boardDTO.getTitle());
                board.setDescription(boardDTO.getDescription());
                return boardRepository.save(board);
            })
            .orElseThrow(() -> new IllegalStateException("Board could not be found"));
    }
}
