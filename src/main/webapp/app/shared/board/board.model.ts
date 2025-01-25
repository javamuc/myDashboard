import { SetWithContentEquality } from 'app/core/util/SetUtils';
import { Task } from '../task/task.model';

export interface Board {
  id?: number;
  title: string;
  tasks: SetWithContentEquality<Task>;
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
