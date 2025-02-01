import { Component, Input, HostListener, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Task, TaskStatus } from '../task/task.model';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AlertService } from 'app/core/util/alert.service';
import { Board } from '../board/board.model';

@Component({
  selector: 'jhi-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
})
export class TaskCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() task!: Task;
  @Input() index!: number;
  @ViewChild('taskCard') taskCard!: ElementRef;
  private destroy$ = new Subject<void>();
  private sidebarIsOpen = signal(false);
  private taskData = signal<Task | undefined>(undefined);
  private activeBoard = signal<Board | undefined>(undefined);
  private readonly alertService = inject(AlertService);

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    const tags = this.getHashtags();
    if (tags.length > 0) {
      this.sidebarService.addTags(tags);
    }

    // Subscribe to active board changes
    this.sidebarService
      .getActiveBoard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.activeBoard.set(board);
      });
  }

  ngAfterViewInit(): void {
    this.sidebarService
      .getIsOpen()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.sidebarIsOpen.set(isOpen);
        this.focusTaskCard();
      });

    this.sidebarService
      .getTaskData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        this.taskData.set(task);
        this.focusTaskCard();
      });
    // setTimeout(() => {
    //   if (this.index === 0 && this.task.status === 'in-progress') {
    //     this.taskCard.nativeElement.focus();
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  @HostListener('keydown.enter', ['$event'])
  @HostListener('click', ['$event'])
  openTask(event: Event): void {
    event.stopPropagation();
    console.warn('openTask', this.taskData()?.id, this.task.id);
    // If this task is already selected, open the sidebar
    if (this.taskData()?.id === this.task.id) {
      this.sidebarService.setActiveComponent('task');
      this.sidebarService.setIsOpen(true);
    }
    // Otherwise just select the task
    else {
      this.sidebarService.setTaskData(this.task);
      this.sidebarService.setBoardId(this.task.boardId);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const currentCard = event.target as HTMLElement;
    const currentColumn = currentCard.closest('.column');
    // command key
    if (event.metaKey || event.ctrlKey) {
      switch (event.key) {
        case 'ArrowLeft': {
          event.preventDefault();
          let newStatus: TaskStatus | undefined;
          if (this.task.status === 'in-progress') {
            newStatus = 'to-do';
          } else if (this.task.status === 'done') {
            newStatus = 'in-progress';
          } else if (this.task.status === 'to-do') {
            newStatus = 'backlog';
          }

          if (newStatus && this.canChangeStatus(newStatus)) {
            this.sidebarService.changeTaskStatus(this.task, newStatus);
          }
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          let newStatus: TaskStatus | undefined;
          if (this.task.status === 'to-do') {
            newStatus = 'in-progress';
          } else if (this.task.status === 'in-progress') {
            newStatus = 'done';
          } else if (this.task.status === 'backlog') {
            newStatus = 'to-do';
          }

          if (newStatus && this.canChangeStatus(newStatus)) {
            this.sidebarService.changeTaskStatus(this.task, newStatus);
          }
          break;
        }
      }
      // no command key
    } else {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const nextCard = currentCard.parentElement?.parentElement?.nextElementSibling?.querySelector('.task-card');
          if (nextCard) {
            (nextCard as HTMLElement).focus();
          }
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prevCard = currentCard.parentElement?.parentElement?.previousElementSibling?.querySelector('.task-card');
          if (prevCard) {
            (prevCard as HTMLElement).focus();
          }
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          console.warn(currentColumn);
          const nextColumn = currentColumn?.nextElementSibling;
          if (nextColumn) {
            const firstCard = nextColumn.querySelector('.task-card');
            if (firstCard) {
              (firstCard as HTMLElement).focus();
            }
          }
          break;
        }
        case 'ArrowLeft': {
          event.preventDefault();
          const prevColumn = currentColumn?.previousElementSibling;
          if (prevColumn) {
            const firstCard = prevColumn.querySelector('.task-card');
            if (firstCard) {
              (firstCard as HTMLElement).focus();
            }
          }
          break;
        }
        case 'p': {
          event.preventDefault();
          let newP = this.task.priority + 1;
          if (newP > 3) {
            newP = 1;
          }
          this.task.priority = newP;
          this.sidebarService.requestTaskUpdate(this.task);
          break;
        }
      }
    }
  }

  getHashtags(): string[] {
    if (!this.task.description) {
      return [];
    }
    const hashtagRegex = /#[\w_-]+/g;
    return this.task.description.match(hashtagRegex) ?? [];
  }

  getTagColor(tag: string): string {
    // Remove the # from the tag
    const cleanTag = tag.slice(1);

    // Generate a hash from the string
    let hash = 0;
    for (let i = 0; i < cleanTag.length; i++) {
      hash = cleanTag.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to HSL (using hue only)
    const hue = Math.abs(hash % 360);

    // Use fixed saturation and lightness for pastel colors
    return `hsl(${hue}, 70%, 85%)`;
  }

  getTagTextColor(tag: string): string {
    // Get the background color
    const hue = Math.abs(this.getTagColorHash(tag) % 360);

    // For pastel backgrounds, we usually want dark text
    return `hsl(${hue}, 90%, 15%)`;
  }

  private focusTaskCard(): void {
    if (!this.sidebarIsOpen() && this.taskData()?.id === this.task.id) {
      this.taskCard.nativeElement.focus();
    }
  }

  private getTagColorHash(tag: string): number {
    const cleanTag = tag.slice(1);
    let hash = 0;
    for (let i = 0; i < cleanTag.length; i++) {
      hash = cleanTag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  private canChangeStatus(newStatus: TaskStatus): boolean {
    const board = this.activeBoard();
    if (!board) return false;

    const tasksInTargetStatus = board.tasks.filter(t => t.status === newStatus).length;

    if (newStatus === 'in-progress' && tasksInTargetStatus >= board.progressLimit) {
      this.alertService.addAlert({
        type: 'warning',
        message: `Cannot move task to In Progress: Board limit of ${board.progressLimit} tasks reached`,
      });
      return false;
    }

    if (newStatus === 'to-do' && tasksInTargetStatus >= board.toDoLimit) {
      this.alertService.addAlert({
        type: 'warning',
        message: `Cannot move task to To Do: Board limit of ${board.toDoLimit} tasks reached`,
      });
      return false;
    }

    return true;
  }
}
