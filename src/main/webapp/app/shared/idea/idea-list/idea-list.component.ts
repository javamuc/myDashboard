import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Idea } from '../idea.model';

@Component({
  selector: 'jhi-idea-list',
  templateUrl: './idea-list.component.html',
  styleUrl: './idea-list.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class IdeaListComponent {
  @Input() ideas: Idea[] = [];
  @Input() loading = false;
  @Input() title = 'Ideas';
  @Input() emptyStateMessage = 'No ideas yet. Click the lightbulb icon in the navbar to capture your first idea!';
}
