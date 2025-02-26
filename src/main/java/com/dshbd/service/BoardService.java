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
public class BoardService extends BaseService {

    private final Logger log = LoggerFactory.getLogger(BoardService.class);

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository, UserService userService) {
        super(userService);
        this.boardRepository = boardRepository;
    }

    public Board createBoard(BoardDTO boardDTO) {
        Board board = new Board();
        board.setTitle(boardDTO.getTitle());
        board.setDescription(boardDTO.getDescription());
        board.setOwnerId(getUserId());
        log.debug("Created Information for Board: {}", board);
        return boardRepository.save(board);
    }

    @Transactional(readOnly = true)
    public List<Board> getCurrentUserBoards() {
        Long userId = getUserId();
        List<Board> boards = boardRepository.findByOwnerIdAndArchived(userId, false);

        if (boards.isEmpty()) {
            log.debug("No boards found for user {}, creating default board", userId);
            Board board = new Board();
            board.setTitle("Default Board");
            board.setDescription("Default Board");
            board.setOwnerId(userId);
            boards.add(boardRepository.saveAndFlush(board));
            log.info("Default board created for user {} with id {}", userId, board.getId());
        }
        return boards;
    }

    @Transactional(readOnly = true)
    public Optional<Board> getBoard(Long id) {
        return boardRepository.findByIdAndOwnerId(id, getUserId());
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
            boardToUpdate.setArchived(boardDTO.isArchived());
            return boardRepository.save(boardToUpdate);
        }
        throw new IllegalStateException("Board could not be found");
    }
}
