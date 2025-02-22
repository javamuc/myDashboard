import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IdeaService } from '../shared/idea/idea.service';
import { Idea } from '../shared/idea/idea.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskListComponent } from '../shared/task/task-list/task-list.component';
import { IdeaListComponent } from '../shared/idea/idea-list/idea-list.component';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule, FormsModule, TaskListComponent, IdeaListComponent],
})
export class DashboardComponent implements OnInit {
  recentIdeas: Idea[] = [];
  loading = true;

  private readonly ideaService = inject(IdeaService);

  ngOnInit(): void {
    this.loadRecentItems();
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
