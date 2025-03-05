import { Injectable } from '@angular/core';
import { forkJoin, firstValueFrom } from 'rxjs';
import { IdeaService } from 'app/shared/idea/idea.service';
import { NoteService } from 'app/notes/note.service';
import { BoardService } from 'app/shared/board/board.service';
import { TaskService } from 'app/shared/task/task.service';
import { HabitService } from 'app/habit/habit.service';
import { DiaryService } from 'app/shared/diary/diary.service';
import { Board } from 'app/shared/board/board.model';
import { Task, TaskStatus } from 'app/shared/task/task.model';
import { Note } from 'app/notes/note.model';
import { Idea } from 'app/shared/idea/idea.model';
import { DiaryEntry, DiaryTag } from 'app/shared/diary/diary.model';
import { Habit, HabitDaySchedule, HabitSpecificTime, DayOfWeek, DayScheduleType, ScheduleType } from 'app/habit/habit.model';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

interface ExportableTask extends Omit<Task, 'id' | 'boardId'> {
  title: string;
  description: string;
  dueDate: string | null;
  priority: number;
  status: TaskStatus;
  assignee: string | undefined;
  createdDate: string;
  lastModifiedDate: string;
  position: number;
}

interface ExportableBoard extends Omit<Board, 'id' | 'ownerId' | 'tasks'> {
  title: string;
  description: string | undefined;
  started: boolean;
  toDoLimit: number;
  progressLimit: number;
  createdDate: string | undefined;
  archived: boolean;
  autoPull: boolean;
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

interface ExportableHabitSpecificTime extends Omit<HabitSpecificTime, 'id' | 'dayScheduleId'> {
  hour: number;
  minute: number;
}

interface ExportableHabitDaySchedule extends Omit<HabitDaySchedule, 'id' | 'habitId'> {
  dayOfWeek: DayOfWeek;
  scheduleType: DayScheduleType;
  repetitions?: number;
  specificTimes: ExportableHabitSpecificTime[];
}

interface ExportableHabit extends Omit<Habit, 'id' | 'userId'> {
  name: string;
  description?: string;
  active: boolean;
  scheduleType: ScheduleType;
  daySchedules: ExportableHabitDaySchedule[];
  createdDate?: string;
  lastModifiedDate?: string;
}

interface ExportableDiaryTag {
  name: string;
  archived: boolean;
  createdDate: string;
  lastModifiedDate?: string;
}

interface ExportableDiaryEntry {
  content: string;
  emoticon: string;
  tags: ExportableDiaryTag[];
  createdDate: string;
}

export interface ExportData {
  version: string;
  exportDate: string;
  data: {
    ideas: ExportableIdea[];
    notes: ExportableNote[];
    boards: ExportableBoard[];
    habits: ExportableHabit[];
    diaryEntries: ExportableDiaryEntry[];
  };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly CURRENT_VERSION = '1.0';
  private readonly resourceUrl: string;

  constructor(
    private ideaService: IdeaService,
    private noteService: NoteService,
    private boardService: BoardService,
    private taskService: TaskService,
    private habitService: HabitService,
    private diaryService: DiaryService,
    private http: HttpClient,
    applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = applicationConfigService.getEndpointFor('api/data');
  }

  async exportData(): Promise<ExportData> {
    try {
      const { ideas, notes, boards, habits, diaryEntries } = await firstValueFrom(
        forkJoin({
          ideas: this.ideaService.query(),
          notes: this.noteService.query(),
          boards: this.boardService.query(),
          habits: this.habitService.query(),
          diaryEntries: this.diaryService.getAllEntries(),
        }),
      );

      // Fetch tasks for each board
      const boardsWithTasks = await Promise.all(
        boards.map(async board => {
          const tasks = await firstValueFrom(this.taskService.getBoardTasks(board.id!));
          return {
            title: board.title,
            description: board.description,
            started: board.started ?? false,
            toDoLimit: board.toDoLimit,
            progressLimit: board.progressLimit,
            createdDate: board.createdDate,
            archived: board.archived ?? false,
            autoPull: board.autoPull ?? false,
            tasks: tasks.map(task => ({
              title: task.title,
              description: task.description ?? '',
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
          ideas: ideas.map(idea => ({
            content: idea.content,
            createdDate: idea.createdDate,
            lastUpdatedDate: idea.lastUpdatedDate,
          })),
          notes: notes.map(note => ({
            title: note.title,
            content: note.content,
            createdDate: note.createdDate,
            lastModifiedDate: note.lastModifiedDate,
          })),
          boards: boardsWithTasks,
          habits: habits.map(habit => ({
            name: habit.name,
            description: habit.description,
            active: habit.active,
            scheduleType: habit.scheduleType,
            daySchedules: habit.daySchedules.map(schedule => ({
              dayOfWeek: schedule.dayOfWeek,
              scheduleType: schedule.scheduleType,
              repetitions: schedule.repetitions,
              specificTimes: schedule.specificTimes.map(time => ({
                hour: time.hour,
                minute: time.minute,
              })),
            })),
            createdDate: habit.createdDate,
            lastModifiedDate: habit.lastModifiedDate,
          })),
          diaryEntries: diaryEntries.map(entry => ({
            content: entry.content,
            emoticon: entry.emoticon.emoji,
            tags: entry.tags.map(tag => ({
              name: tag.name,
              archived: tag.archived,
              createdDate: tag.createdDate instanceof Date ? tag.createdDate.toISOString() : tag.createdDate,
              lastModifiedDate: tag.lastModifiedDate instanceof Date ? tag.lastModifiedDate.toISOString() : tag.lastModifiedDate,
            })),
            createdDate: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
          })),
        },
      };
    } catch (error) {
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async importData(file: File): Promise<void> {
    try {
      const fileContent = await this.readFileContent(file);
      const importData = JSON.parse(fileContent) as ExportData;

      // Validate the imported data
      this.validateImportData(importData);

      // Send the data to the backend for import
      await firstValueFrom(this.http.post(`${this.resourceUrl}/import`, importData));
    } catch (error) {
      throw new Error(`Failed to import data: ${error instanceof Error ? error.message : String(error)}`);
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

  private validateImportData(data: unknown): asserts data is ExportData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid import data format');
    }

    const importData = data as Partial<ExportData>;

    if (!importData.version || !importData.exportDate || !importData.data) {
      throw new Error('Import data is missing required fields');
    }

    if (
      !Array.isArray(importData.data.ideas) ||
      !Array.isArray(importData.data.notes) ||
      !Array.isArray(importData.data.boards) ||
      !Array.isArray(importData.data.habits) ||
      !Array.isArray(importData.data.diaryEntries)
    ) {
      throw new Error('Import data has invalid structure');
    }

    // Version check
    const [majorImport] = importData.version.split('.');
    const [majorCurrent] = this.CURRENT_VERSION.split('.');
    if (majorImport !== majorCurrent) {
      throw new Error(`Incompatible import version. Expected ${this.CURRENT_VERSION}, got ${importData.version}`);
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
