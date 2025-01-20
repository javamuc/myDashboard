export interface Note {
  id?: number;
  title: string;
  content: string;
  lastModified?: Date;
  created?: Date;
  lastModifiedDate?: string;
  createdDate?: string;
  user?: any;
}
