import { Component, Input, EventEmitter, HostListener, Output, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Idea } from '../idea.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IdeaService } from '../idea.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'jhi-idea-list',
  templateUrl: './idea-list.component.html',
  styleUrl: './idea-list.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
})
export class IdeaListComponent implements OnInit, OnDestroy {
  @Input() title = 'Ideas';
  @Input() emptyStateMessage = 'No ideas yet. Click the lightbulb icon in the navbar to capture your first idea!';
  @Output() convertToTask = new EventEmitter<Idea>();
  @Output() convertToNote = new EventEmitter<Idea>();

  recentIdeas: Idea[] = [];
  loading = true;
  selectedIdeaId: number | null = null;

  ideaCreatedSub?: Subscription;
  private readonly ideaService = inject(IdeaService);

  ngOnInit(): void {
    this.loadRecentItems();
    this.ideaCreatedSub = this.ideaService.ideaCreated.subscribe(idea => {
      // adds the new idea on first position
      this.recentIdeas.unshift(idea);
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
        if (selectedIdea) this.convertToTask.emit(selectedIdea);
        break;
      case 'n':
        event.preventDefault();
        if (selectedIdea) this.convertToNote.emit(selectedIdea);
        break;
    }
  }

  protected deleteIdea(selectedIdeaId: number): void {
    this.ideaService.delete(selectedIdeaId).subscribe(() => {
      this.recentIdeas = this.recentIdeas.filter(i => i.id !== selectedIdeaId);
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
