import type { Chapters, Tags, Users, Works } from "astro:db";

export type Work = typeof Works.$inferSelect;
export type Chapter = typeof Chapters.$inferSelect;
export type Tag = typeof Tags.$inferSelect;
export type User = typeof Users.$inferSelect;

export type atProtoWork = Omit<Work, "id" | "slug"> | {
  createdAt: string;
  updatedAt?: string;
};

export type atProtoChapter = Omit<Chapter, "id" | "uri" | "slug" | "workId"> | {
  workUri: string;
  chapterRef?: string;
  content: ChapterText | BskyPost | LeafletDoc;
  createdAt: string;
  updatedAt?: string;
};

export type atProtoComment = {
  content: string;
  createdAt: string;
  postedTo?: string;
};

type comAtProtoStrongRef = {
  uri: string;
  cid: string;
};

export type ChapterText = {
  $type: "fan.fics.work.chapter#chapterText";
  text: string;
};

export type BskyPost = {
  $type: "fan.fics.work.chapter#bskyPost";
  postRef: comAtProtoStrongRef;
};

export type LeafletDoc = {
  $type: "fan.fics.work.chapter#leafletDoc";
  docRef: comAtProtoStrongRef;
};