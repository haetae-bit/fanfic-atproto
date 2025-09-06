export interface Work {
  slug: string;
  title: string;
  author: string;
  tags: Tag[];
  content: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export interface Tag {
  label: string;
  url: string;
}