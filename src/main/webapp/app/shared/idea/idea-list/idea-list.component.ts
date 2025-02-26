import { Component, Input, EventEmitter, HostListener, Output, inject, OnInit, OnDestroy } from '@angular/core';
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

  private readonly ideaService = inject(IdeaService);
  private readonly taskService = inject(TaskService);
  private readonly noteService = inject(NoteService);
  private readonly boardService = inject(BoardService);

  ngOnInit(): void {
    this.loadRecentItems();
    this.ideaCreatedSub = this.ideaService.ideaCreated.subscribe(() => {
      this.loadRecentItems();
    });
    this.boardService.query().subscribe(boards => {
      this.boards = boards;
    });
  }

  ngOnDestroy(): void {
    this.ideaCreatedSub?.unsubscribe();
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
    }
  }

  protected makeTask(selectedIdea: Idea): void {
    console.warn('makeTask', selectedIdea);
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

  protected deleteIdea(selectedIdeaId: number, deleteFromList = true): void {
    this.ideaService.delete(selectedIdeaId).subscribe(() => {
      if (deleteFromList) {
        this.recentIdeas = this.recentIdeas.filter(i => i.id !== selectedIdeaId);
      }
    });
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
