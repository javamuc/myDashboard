export type TaskStatus = 'to-do' | 'in-progress' | 'done';

export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate: string;
  priority: number;
  status: TaskStatus;
  assignee?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}