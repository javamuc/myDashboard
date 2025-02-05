package com.dshbd.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.dshbd.domain.Board;
import com.dshbd.domain.User;
import com.dshbd.repository.BoardRepository;
import com.dshbd.service.dto.BoardDTO;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private BoardService boardService;

    private User user;
    private Board board;
    private BoardDTO boardDTO;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        board = new Board();
        board.setId(1L);
        board.setTitle("Test Board");
        board.setDescription("Test Description");
        board.setOwnerId(1L);

        boardDTO = new BoardDTO();
        boardDTO.setId(1L);
        boardDTO.setTitle("Test Board");
        boardDTO.setDescription("Test Description");
    }

    @Test
    void createBoard_Success() {
        // Arrange
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.save(any(Board.class))).thenReturn(board);

        // Act
        Board result = boardService.createBoard(boardDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo(boardDTO.getTitle());
        assertThat(result.getDescription()).isEqualTo(boardDTO.getDescription());
        assertThat(result.getOwnerId()).isEqualTo(user.getId());
        verify(boardRepository).save(any(Board.class));
    }

    @Test
    void createBoard_UserNotFound() {
        // Arrange
        when(userService.getUserWithAuthorities()).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> boardService.createBoard(boardDTO))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("User could not be found");
        verify(boardRepository, never()).save(any(Board.class));
    }

    @Test
    void getCurrentUserBoards_WithExistingBoards() {
        // Arrange
        List<Board> boards = Arrays.asList(board);
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.findByOwnerIdAndArchived(user.getId(), false)).thenReturn(boards);

        // Act
        List<Board> result = boardService.getCurrentUserBoards();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo(board.getTitle());
        verify(boardRepository).findByOwnerIdAndArchived(user.getId(), false);
        verify(boardRepository, never()).save(any(Board.class));
    }

    @Test
    void getCurrentUserBoards_CreatesDefaultBoard() {
        // Arrange
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.findByOwnerIdAndArchived(user.getId(), false)).thenReturn(new ArrayList<Board>());
        when(boardRepository.save(any(Board.class))).thenReturn(board);

        // Act
        List<Board> result = boardService.getCurrentUserBoards();

        // Assert
        assertThat(result).hasSize(1);
        verify(boardRepository).findByOwnerIdAndArchived(user.getId(), false);
        verify(boardRepository).save(any(Board.class));
        verify(boardRepository).flush();
    }

    @Test
    void getBoard_Success() {
        // Arrange
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.findByIdAndOwnerId(board.getId(), user.getId())).thenReturn(Optional.of(board));

        // Act
        Optional<Board> result = boardService.getBoard(board.getId());

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo(board.getTitle());
        verify(boardRepository).findByIdAndOwnerId(board.getId(), user.getId());
    }

    @Test
    void getBoard_NotFound() {
        // Arrange
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.findByIdAndOwnerId(board.getId(), user.getId())).thenReturn(Optional.empty());

        // Act
        Optional<Board> result = boardService.getBoard(board.getId());

        // Assert
        assertThat(result).isEmpty();
        verify(boardRepository).findByIdAndOwnerId(board.getId(), user.getId());
    }

    @Test
    void deleteBoard_Success() {
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.findByIdAndOwnerId(board.getId(), user.getId())).thenReturn(Optional.of(board));
        // Act
        boardService.deleteBoard(board.getId());

        // Assert
        verify(boardRepository, never()).deleteById(board.getId());
        verify(boardRepository).save(board);
    }

    @Test
    void updateBoard_Success() {
        // Arrange
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.findByIdAndOwnerId(board.getId(), user.getId())).thenReturn(Optional.of(board));
        when(boardRepository.save(any(Board.class))).thenReturn(board);

        // Act
        Board result = boardService.updateBoard(board.getId(), boardDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo(boardDTO.getTitle());
        assertThat(result.getDescription()).isEqualTo(boardDTO.getDescription());
        verify(boardRepository).save(any(Board.class));
    }

    @Test
    void updateBoard_NotFound() {
        // Arrange
        when(userService.getUserWithAuthorities()).thenReturn(Optional.of(user));
        when(boardRepository.findByIdAndOwnerId(board.getId(), user.getId())).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> boardService.updateBoard(board.getId(), boardDTO))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("Board could not be found");
        verify(boardRepository, never()).save(any(Board.class));
    }
}
