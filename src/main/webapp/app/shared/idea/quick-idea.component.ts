import { Component, ElementRef, HostListener, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IdeaService } from './idea.service';
import { NewIdea } from './idea.model';

@Component({
  selector: 'jhi-quick-idea',
  templateUrl: './quick-idea.component.html',
  styleUrl: './quick-idea.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class QuickIdeaComponent {
  @ViewChild('ideaInput') ideaInput!: ElementRef<HTMLTextAreaElement>;

  isOpen = signal(false);
  content = '';

  constructor(private ideaService: IdeaService) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Open overlay with Cmd+I (Mac) or Ctrl+I (Windows)
    if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
      event.preventDefault();
      this.openOverlay();
    }
  }

  toggleOverlay(event: Event): void {
    event.stopPropagation();
    if (this.isOpen()) {
      this.closeOverlay();
    } else {
      this.openOverlay();
    }
  }

  onOverlayClick(event: Event): void {
    event.stopPropagation();
    this.closeOverlay();
  }

  onKeyDown(event: KeyboardEvent): void {
    // Save on Enter or Cmd+Enter
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveIdea();
      this.closeOverlay();
      this.content = '';
    } else if (event.key === 'Escape') {
      this.closeOverlay();
      this.content = '';
    }
  }

  private openOverlay(): void {
    this.isOpen.set(true);
    this.content = '';
    setTimeout(() => {
      this.ideaInput.nativeElement.focus();
    });
  }

  private closeOverlay(): void {
    this.isOpen.set(false);
    this.content = '';
  }

  private saveIdea(): void {
    if (this.content.trim()) {
      const newIdea: NewIdea = {
        content: this.content.trim(),
      };

      this.ideaService.create(newIdea).subscribe(() => {
        this.closeOverlay();
      });
    } else {
      this.closeOverlay();
    }
  }
}
