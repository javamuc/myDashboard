import { Component, Input, EventEmitter, HostListener, Output, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Idea } from '../idea.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IdeaService } from '../idea.service';
import { Subscription } from 'rxjs';
import { TaskService } from 'app/shared/task/task.service';
import { NoteService } from 'app/notes/note.service';
import { BoardService } from 'app/shared/board/board.service';
import { Board } from 'app/shared/board/board.model';
import { IdeaCardComponent } from '../idea-card/idea-card.component';
import { TaskStatus, NewTask } from 'app/shared/task/task.model';

@Component({
  selector: 'jhi-idea-list',
  templateUrl: './idea-list.component.html',
  styleUrl: './idea-list.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, IdeaCardComponent],
})
export class IdeaListComponent implements OnInit, OnDestroy {
  @Input() title = 'Ideas';
  @Input() emptyStateMessage = 'No ideas yet. Click the lightbulb icon in the navbar to capture your first idea!';

  recentIdeas: Idea[] = [];
  loading = true;
  selectedIdeaId: number | null = null;
  ideaCreatedSub?: Subscription;
  boards: Board[] = [];

  // Board selection for task creation
  showBoardSelector = false;
  selectedIdea: Idea | null = null;
  boardSelectorPosition = { top: 0, left: 0 };

  @ViewChild('boardSelector') boardSelector?: ElementRef;

  private readonly ideaService = inject(IdeaService);
  private readonly taskService = inject(TaskService);
  private readonly noteService = inject(NoteService);
  private readonly boardService = inject(BoardService);

  ngOnInit(): void {
    this.loadRecentItems();
    this.ideaCreatedSub = this.ideaService.ideaCreated.subscribe(() => {
      this.loadRecentItems();
    });
    this.loadBoards();

    // Close board selector when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    this.ideaCreatedSub?.unsubscribe();
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  loadBoards(): void {
    this.boardService.query().subscribe(boards => {
      this.boards = boards.filter(board => !board.archived);
    });
  }

  selectIdea(ideaId: number): void {
    this.selectedIdeaId = ideaId;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvents(event: KeyboardEvent): void {
    if (!this.selectedIdeaId) return;

    const selectedIdea = this.recentIdeas.find(i => i.id === this.selectedIdeaId);

    switch (event.key.toLowerCase()) {
      case 'backspace':
        event.preventDefault();
        this.deleteIdea(this.selectedIdeaId);
        break;
      case 't':
        event.preventDefault();
        if (selectedIdea) this.makeTask(selectedIdea);
        break;
      case 'n':
        event.preventDefault();
        if (selectedIdea) this.makeNote(selectedIdea);
        break;
      case 'escape':
        event.preventDefault();
        this.closeBoardSelector();
        break;
    }
  }

  selectBoard(boardId: number): void {
    if (this.selectedIdea) {
      this.createTaskOnBoard(this.selectedIdea, boardId);
    }
    this.closeBoardSelector();
  }

  createTaskOnBoard(idea: Idea, boardId: number): void {
    const newTask: NewTask = {
      title: idea.content,
      description: '',
      dueDate: null,
      priority: 1,
      status: 'backlog',
      boardId,
      position: 0, // Will be positioned at the top of the TO_DO column
    };

    this.taskService.create(newTask).subscribe(() => {
      // Delete the idea after successful task creation
      this.deleteIdea(idea.id, false);
    });
  }

  closeBoardSelector(): void {
    this.showBoardSelector = false;
    this.selectedIdea = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Ignore clicks on buttons that trigger the board selector
    const target = event.target as HTMLElement;
    if (target.closest('button') && target.closest('button')?.title === 'Convert to Task') {
      return;
    }

    // Close board selector when clicking outside
    if (this.showBoardSelector && this.boardSelector && !this.boardSelector.nativeElement.contains(event.target)) {
      this.closeBoardSelector();
    }
  }

  protected makeTaskWithEvent(data: { idea: Idea; event: MouseEvent }): void {
    console.warn('makeTaskWithEvent called with data:', data);
    this.makeTask(data.idea, data.event);
  }

  protected makeTask(idea: Idea, event?: MouseEvent): void {
    console.warn('makeTask called with event:', event);
    this.selectedIdea = idea;

    // If there's only one board, use it directly
    if (this.boards.length === 1) {
      this.createTaskOnBoard(idea, this.boards[0].id!);
      return;
    }

    // Otherwise show board selector
    if (event) {
      // Position the board selector near the clicked button
      const target = event.target as HTMLElement;
      const button = target.closest('button') ?? target;
      const rect = button.getBoundingClientRect();
      console.warn('Button rect:', rect);

      // Set position with a slight offset
      this.boardSelectorPosition = {
        top: rect.bottom + window.scrollY + 5, // Add 5px offset
        left: rect.left + window.scrollX,
      };
      console.warn('Board selector position:', this.boardSelectorPosition);
    } else {
      // Default position if no event is provided
      this.boardSelectorPosition = {
        top: 100,
        left: 100,
      };
    }

    // Ensure we're not closing the selector immediately
    setTimeout(() => {
      this.showBoardSelector = true;
      console.warn('showBoardSelector set to:', this.showBoardSelector);
    }, 0);
  }

  protected makeNote(selectedIdea: Idea): void {
    this.noteService
      .create({
        title: selectedIdea.content,
        content: '',
      })
      .subscribe(() => {
        this.deleteIdea(selectedIdea.id, false);
      });
  }

  protected deleteFromList(selectedIdeaId: number): void {
    this.removeFromList(selectedIdeaId);
  }

  protected deleteIdea(selectedIdeaId: number, deleteFromList = true): void {
    this.ideaService.delete(selectedIdeaId).subscribe(() => {
      if (deleteFromList) {
        this.removeFromList(selectedIdeaId);
      }
    });
  }

  private removeFromList(selectedIdeaId: number): void {
    this.recentIdeas = this.recentIdeas.filter(i => i.id !== selectedIdeaId);
  }

  private loadRecentItems(): void {
    // Load recent ideas
    this.ideaService.query().subscribe(ideas => {
      this.recentIdeas = ideas
        .sort((a, b) => {
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
      this.loading = false;
    });
  }
}
