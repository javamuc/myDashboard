import { Updateable } from 'app/core/util/SetUtils';

export type TaskStatus = 'to-do' | 'in-progress' | 'done';

export class Task implements Updateable<Task> {
  id?: number;
  title: string;
  description: string;
  dueDate: string | undefined;
  priority: number;
  status: TaskStatus;
  assignee?: string;
  createdDate?: string;
  lastModifiedDate?: string;
  boardId: number | undefined;

  constructor(data: Partial<Task> = {}) {
    this.title = data.title ?? '';
    this.description = data.description ?? '';
    this.priority = data.priority ?? 1;
    this.status = data.status ?? 'to-do';
    this.dueDate = data.dueDate;
    this.assignee = data.assignee;
    this.createdDate = data.createdDate;
    this.lastModifiedDate = data.lastModifiedDate;
    this.boardId = data.boardId;
    this.id = data.id;
  }

  update(item: Task): this {
    this.title = item.title;
    this.description = item.description;
    this.priority = item.priority;
    this.status = item.status;
    this.dueDate = item.dueDate;
    this.assignee = item.assignee;
    this.createdDate = item.createdDate;
    this.lastModifiedDate = item.lastModifiedDate;
    this.boardId = item.boardId;
    return this;
  }
}
