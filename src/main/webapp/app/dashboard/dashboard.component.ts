import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IdeaService } from '../shared/idea/idea.service';
import { TaskService } from '../shared/task/task.service';
import { Idea } from '../shared/idea/idea.model';
import { Task, TaskVM } from '../shared/task/task.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  recentIdeas: Idea[] = [];
  recentTasks: TaskVM[] = [];
  loading = true;

  private readonly ideaService = inject(IdeaService);
  private readonly taskService = inject(TaskService);

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

    // Load recent tasks
    this.taskService.findTasksByStatus('in-progress').subscribe(taskVMs => {
      this.recentTasks = taskVMs
        .sort((a, b) => {
          const dateA = a.task.createdDate ? new Date(a.task.createdDate).getTime() : 0;
          const dateB = b.task.createdDate ? new Date(b.task.createdDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
      this.loading = false;
    });
  }
}
