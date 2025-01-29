import { Board } from '../board/board.model';

export type TaskStatus = 'to-do' | 'in-progress' | 'done' | 'backlog';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
  priority: number;
  status: TaskStatus;
  assignee?: string;
  createdDate: string;
  lastModifiedDate: string;
  boardId: number;
}
export interface NewTask {
  title: string;
  description: string;
  dueDate: string | null;
  priority: number;
  status: TaskStatus;
  assignee?: string;
  boardId: number | undefined;
}

export interface TaskVM {
  task: Task;
  board: Board;
}
