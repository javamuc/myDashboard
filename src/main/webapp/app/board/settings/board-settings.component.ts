import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import SharedModule from 'app/shared/shared.module';
import { Board } from 'app/shared/board/board.model';
import { BoardService } from 'app/shared/board/board.service';
import { Subject, takeUntil } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';

@Component({
  selector: 'jhi-board-settings',
  templateUrl: './board-settings.component.html',
  styleUrls: ['./board-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, SharedModule],
})
export class BoardSettingsComponent implements OnInit, OnDestroy {
  boards: Board[] = [];
  selectedBoard: Board | null = null;
  newBoardTitle = '';
  isEditing = false;
  private destroy$ = new Subject<void>();

  constructor(
    private boardService: BoardService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadBoards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoards(): void {
    this.boardService
      .query()
      .pipe(takeUntil(this.destroy$))
      .subscribe(boards => {
        this.boards = boards;
      });
  }

  selectBoard(board: Board): void {
    this.selectedBoard = { ...board };
    this.isEditing = true;
  }

  createBoard(): void {
    if (!this.newBoardTitle.trim()) {
      return;
    }

    const newBoard = {
      title: this.newBoardTitle.trim(),
      archived: false,
      toDoLimit: 0,
      progressLimit: 0,
      tasks: [],
    } as Board;

    this.boardService.create(newBoard).subscribe({
      next: board => {
        this.boards.push(board);
        this.newBoardTitle = '';
        this.alertService.addAlert({ type: 'success', message: 'Board created successfully' });
      },
      error: () => {
        this.alertService.addAlert({ type: 'danger', message: 'Error creating board' });
      },
    });
  }

  updateBoard(): void {
    if (!this.selectedBoard) {
      return;
    }

    this.boardService.update(this.selectedBoard).subscribe({
      next: updatedBoard => {
        const index = this.boards.findIndex(b => b.id === updatedBoard.id);
        if (index !== -1) {
          this.boards[index] = updatedBoard;
        }
        this.isEditing = false;
        this.selectedBoard = null;
        this.alertService.addAlert({ type: 'success', message: 'Board updated successfully' });
      },
      error: () => {
        this.alertService.addAlert({ type: 'danger', message: 'Error updating board' });
      },
    });
  }

  toggleArchiveBoard(board: Board): void {
    const updatedBoard = { ...board, archived: !board.archived };
    this.boardService.update(updatedBoard).subscribe({
      next: result => {
        const index = this.boards.findIndex(b => b.id === result.id);
        if (index !== -1) {
          this.boards[index] = result;
        }
        this.alertService.addAlert({
          type: 'success',
          message: `Board ${result.archived ? 'archived' : 'unarchived'} successfully`,
        });
      },
      error: () => {
        this.alertService.addAlert({ type: 'danger', message: 'Error updating board' });
      },
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedBoard = null;
  }
}
