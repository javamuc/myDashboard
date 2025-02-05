package com.dshbd.service;

import com.dshbd.domain.Board;
import com.dshbd.repository.BoardRepository;
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
                board.setOwnerId(user.getId());
                log.debug("Created Information for Board: {}", board);
                return boardRepository.save(board);
            })
            .orElseThrow(() -> new IllegalStateException("User could not be found"));
    }

    @Transactional(readOnly = true)
    public List<Board> getCurrentUserBoards() {
        Long userId = userService.getUserWithAuthorities().orElseThrow(() -> new IllegalStateException("User could not be found")).getId();
        List<Board> boards = boardRepository.findByOwnerIdAndArchived(userId, false);

        if (boards.isEmpty()) {
            log.debug("No boards found for user {}, creating default board", userId);
            Board board = new Board();
            board.setTitle("Life Board");
            board.setDescription("Default Board");
            board.setOwnerId(userId);
            boards.add(boardRepository.save(board));
            boardRepository.flush();
            log.info("Default board created for user {} with id {}", userId, board.getId());
        }
        return boards;
    }

    @Transactional(readOnly = true)
    public Optional<Board> getBoard(Long id) {
        return boardRepository.findByIdAndOwnerId(
            id,
            userService.getUserWithAuthorities().orElseThrow(() -> new IllegalStateException("User could not be found")).getId()
        );
    }

    public void deleteBoard(Long id) {
        getBoard(id).ifPresent(board -> {
            board.setArchived(true);
            boardRepository.save(board);
        });
    }

    public Board updateBoard(Long id, BoardDTO boardDTO) {
        Optional<Board> board = getBoard(id);
        if (board.isPresent()) {
            Board boardToUpdate = board.get();
            boardToUpdate.setTitle(boardDTO.getTitle());
            boardToUpdate.setDescription(boardDTO.getDescription());
            boardToUpdate.setToDoLimit(boardDTO.getToDoLimit());
            boardToUpdate.setProgressLimit(boardDTO.getProgressLimit());
            boardToUpdate.setAutoPull(boardDTO.isAutoPull());
            boardToUpdate.setStarted(boardDTO.isStarted());
            return boardRepository.save(boardToUpdate);
        }
        return null;
    }
}
