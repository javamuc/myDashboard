import { Task } from '../task/task.model';

export interface Board {
  id?: number;
  title: string;
  tasks: Task[];
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface BoardFilter {
  property: keyof Task;
  value: string | number | Date;
}

export interface BoardSort {
  property: keyof Task;
  direction: 'asc' | 'desc';
}

export interface BoardView {
  filters: BoardFilter[];
  sort?: BoardSort;
  searchTerm?: string;
}
