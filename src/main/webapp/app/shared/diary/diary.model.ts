export interface DiaryEmoticon {
  id: number;
  name: string;
  emoji: string;
  shortcut: string;
}

export interface DiaryTag {
  id: number;
  name: string;
}

export interface DiaryEntry {
  id: number;
  emoticon: DiaryEmoticon;
  tags: DiaryTag[];
  content: string;
  createdAt: Date;
}

export interface NewDiaryEntry extends Omit<DiaryEntry, 'id' | 'createdAt'> {}
