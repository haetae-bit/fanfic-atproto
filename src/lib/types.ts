export interface Work {
  id: number;
  title: string;
  author: number | string;
  tags: Array<Tag>;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string | undefined;
}

export interface Tag {
  label: string;
  url: string;
}