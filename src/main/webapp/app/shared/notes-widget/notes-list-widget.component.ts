import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NoteSummary } from './note-summary.model';
import { NotesWidgetService } from './notes-widget.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faClock } from '@fortawesome/free-solid-svg-icons';
import { NgFor, NgIf, DatePipe } from '@angular/common';

@Component({
  selector: 'jhi-notes-list-widget',
  templateUrl: './notes-list-widget.component.html',
  styleUrls: ['./notes-list-widget.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FontAwesomeModule],
  providers: [DatePipe],
})
export class NotesListWidgetComponent implements OnInit, OnDestroy {
  recentNotes: NoteSummary[] = [];
  loading = true;
  faEdit = faEdit;
  faClock = faClock;

  private destroy$ = new Subject<void>();

  constructor(
    private notesWidgetService: NotesWidgetService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadRecentNotes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecentNotes(): void {
    this.loading = true;
    this.notesWidgetService
      .getRecentNotes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: notes => {
          this.recentNotes = notes;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  openNote(id: number): void {
    this.router.navigate(['/notes', id]);
  }
}
