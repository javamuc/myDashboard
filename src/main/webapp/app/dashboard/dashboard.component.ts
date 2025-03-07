import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IdeaService } from '../shared/idea/idea.service';
import { Idea } from '../shared/idea/idea.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskListComponent } from '../shared/task/task-list/task-list.component';
import { IdeaListComponent } from '../shared/idea/idea-list/idea-list.component';
import { NotesListWidgetComponent } from '../shared/notes-widget/notes-list-widget.component';

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule, FormsModule, TaskListComponent, IdeaListComponent, NotesListWidgetComponent],
})
export class DashboardComponent {}
