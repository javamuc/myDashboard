export interface Note {
  id: number;
  title: string;
  content: string;
  lastModifiedDate: string;
  createdDate: string;
  user_id: number;
}

export interface NewNote extends Omit<Note, 'id' | 'lastModifiedDate' | 'createdDate' | 'user_id'> {
  title: string;
  content: string;
}
