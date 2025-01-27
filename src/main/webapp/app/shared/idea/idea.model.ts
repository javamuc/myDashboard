export interface Idea {
  id?: number;
  content: string;
  createdDate?: string;
  lastUpdatedDate?: string;
}

export interface NewIdea extends Omit<Idea, 'id' | 'createdDate' | 'lastUpdatedDate'> {
  id?: number;
}
