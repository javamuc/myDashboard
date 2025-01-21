import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Board, BoardFilter, BoardSort, BoardView } from './board.model';
import { Task, TaskStatus } from '../task/task.model';
import { TaskComponent } from '../task/task.component';
import SharedModule from 'app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarService } from 'app/layouts/sidebar/sidebar.service';
import { BoardService } from './board.service';

type TaskProperty = keyof Task;

@Component({
  selector: 'jhi-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TaskComponent, SharedModule, FontAwesomeModule],
})
export class BoardComponent implements OnInit {
  readonly statuses: TaskStatus[] = ['to-do', 'in-progress', 'done'];
  readonly taskProperties: TaskProperty[] = ['title', 'assignee', 'dueDate', 'priority', 'status', 'createdDate', 'lastModifiedDate'];

  filterMenuOpen = signal(false);
  sortMenuOpen = signal(false);

  boards = signal<Board[]>([]);
  activeBoard = signal<Board | undefined>(undefined);

  boardView = signal<BoardView>({
    filters: [],
    sort: { property: 'lastModifiedDate', direction: 'desc' },
    searchTerm: '',
  });

  filteredTasks = computed(() => {
    const board = this.activeBoard();
    if (!board) return [];

    let tasks = [...board.tasks];

    // Apply search term filter
    if (this.boardView().searchTerm) {
      tasks = tasks.filter(task => task.title.toLowerCase().includes(this.boardView().searchTerm!.toLowerCase()));
    }

    // Apply property filters
    this.boardView().filters.forEach(filter => {
      tasks = tasks.filter(task => {
        const taskValue = task[filter.property];
        return taskValue === filter.value;
      });
    });

    // Apply sorting
    const sort = this.boardView().sort;
    if (sort) {
      tasks.sort((a, b) => {
        const aValue = a[sort.property];
        const bValue = b[sort.property];
        const comparison = aValue === undefined || bValue === undefined ? 0 : aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return tasks;
  });

  tasksByStatus = computed(() => {
    const grouped = new Map<TaskStatus, Task[]>();
    this.statuses.forEach(status => grouped.set(status, []));

    this.filteredTasks().forEach(task => {
      const statusTasks = grouped.get(task.status) ?? [];
      statusTasks.push(task);
      grouped.set(task.status, statusTasks);
    });

    return grouped;
  });

  private readonly sidebarService = inject(SidebarService);
  private readonly boardService = inject(BoardService);

  ngOnInit(): void {
    this.loadBoards();
  }

  addFilter(property: TaskProperty, value: any): void {
    const filters = [...this.boardView().filters];
    filters.push({ property, value });
    this.boardView.update(view => ({ ...view, filters }));
    this.filterMenuOpen.set(false);
  }

  removeFilter(index: number): void {
    const filters = [...this.boardView().filters];
    filters.splice(index, 1);
    this.boardView.update(view => ({ ...view, filters }));
  }

  setSort(property: TaskProperty): void {
    const currentSort = this.boardView().sort;
    let newSort: BoardSort;

    if (currentSort?.property === property) {
      newSort = {
        property,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      newSort = { property, direction: 'asc' };
    }

    this.boardView.update(view => ({ ...view, sort: newSort }));
    this.sortMenuOpen.set(false);
  }

  setSearchTerm(term: string): void {
    this.boardView.update(view => ({ ...view, searchTerm: term }));
  }

  createNewTask(event: Event): void {
    event.stopPropagation();
    this.sidebarService.setActiveComponent('task');
    this.sidebarService.setIsOpen(true);
  }

  getTaskCount(status: TaskStatus): number {
    return this.tasksByStatus().get(status)?.length ?? 0;
  }

  private loadBoards(): void {
    this.boardService.query().subscribe(boards => {
      this.boards.set(boards);
      if (boards.length > 0) {
        this.activeBoard.set(boards[0]);
      }
    });
  }
}
