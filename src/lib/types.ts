export type Work = {
  slug: string;
  title: string;
  author: string;
  tags: Tag[];
  summary: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export type Chapter = {
  order: number;
  title: string;
  notes?: string | undefined;
  content: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export type Tag = {
  type: "character" | "relationship" | "series" | "warnings";
  label: string;
  url?: string;
}