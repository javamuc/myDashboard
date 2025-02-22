import { Injectable } from '@angular/core';
import { forkJoin, firstValueFrom } from 'rxjs';
import { IdeaService } from 'app/shared/idea/idea.service';
import { NoteService } from 'app/notes/note.service';
import { BoardService } from 'app/shared/board/board.service';
import { TaskService } from 'app/shared/task/task.service';
import { Board } from 'app/shared/board/board.model';
import { Task } from 'app/shared/task/task.model';
import { Note } from 'app/notes/note.model';
import { Idea } from 'app/shared/idea/idea.model';

interface ExportableTask extends Omit<Task, 'id' | 'boardId'> {
  position: number;
}

interface ExportableBoard extends Omit<Board, 'id' | 'ownerId' | 'tasks'> {
  tasks: ExportableTask[];
}

interface ExportableNote extends Omit<Note, 'id' | 'user_id'> {
  title: string;
  content: string;
  createdDate: string;
  lastModifiedDate: string;
}

interface ExportableIdea extends Omit<Idea, 'id' | 'ownerId'> {
  content: string;
  createdDate?: string;
  lastUpdatedDate?: string;
}

export interface ExportData {
  version: string;
  exportDate: string;
  data: {
    ideas: ExportableIdea[];
    notes: ExportableNote[];
    boards: ExportableBoard[];
  };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly CURRENT_VERSION = '1.0';

  constructor(
    private ideaService: IdeaService,
    private noteService: NoteService,
    private boardService: BoardService,
    private taskService: TaskService,
  ) {}

  async exportData(): Promise<ExportData> {
    try {
      const { ideas, notes, boards } = await firstValueFrom(
        forkJoin({
          ideas: this.ideaService.query(),
          notes: this.noteService.query(),
          boards: this.boardService.query(),
        }),
      );

      // Fetch tasks for each board
      const boardsWithTasks = await Promise.all(
        boards.map(async board => {
          const tasks = await firstValueFrom(this.taskService.getBoardTasks(board.id!));
          return {
            // Remove id and ownerId from board
            title: board.title,
            description: board.description,
            started: board.started,
            toDoLimit: board.toDoLimit,
            progressLimit: board.progressLimit,
            createdDate: board.createdDate,
            archived: board.archived,
            autoPull: board.autoPull,
            // Include tasks without id and boardId
            tasks: tasks.map(task => ({
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              priority: task.priority,
              status: task.status,
              assignee: task.assignee,
              createdDate: task.createdDate,
              lastModifiedDate: task.lastModifiedDate,
              position: task.position ?? 0,
            })),
          };
        }),
      );

      return {
        version: this.CURRENT_VERSION,
        exportDate: new Date().toISOString(),
        data: {
          // Remove id and ownerId from ideas
          ideas: ideas.map(idea => ({
            content: idea.content,
            createdDate: idea.createdDate,
            lastUpdatedDate: idea.lastUpdatedDate,
          })),
          // Remove id and user_id from notes
          notes: notes.map(note => ({
            title: note.title,
            content: note.content,
            createdDate: note.createdDate,
            lastModifiedDate: note.lastModifiedDate,
          })),
          boards: boardsWithTasks,
        },
      };
    } catch (error) {
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  downloadJson(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
