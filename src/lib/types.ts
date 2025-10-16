import type { ComAtprotoRepoStrongRef } from "@atproto/api";
import type { Chapters, Tags, Users, Works } from "astro:db";

export type Work = typeof Works.$inferSelect;
export type Chapter = typeof Chapters.$inferSelect;
export type Tag = typeof Tags.$inferSelect;
export type User = typeof Users.$inferSelect;

export type atProtoWork = Pick<Work, "title" | "author" | "summary" | "tags"> & {
  createdAt: string;
  updatedAt?: string;
};

export type atProtoChapter = Pick<Chapter, "title" | "warnings" | "authorsNotes" | "endNotes"> & {
  chapterRef?: ComAtprotoRepoStrongRef.Main;
  content: ChapterText | BskyPost | LeafletDoc;
  createdAt: string;
  updatedAt?: string;
};

export type atProtoComment = {
  content: string;
  createdAt: string;
  postedTo?: string;
};

export type ChapterText = {
  $type: "fan.fics.work.chapter#chapterText";
  text: string;
};

export type BskyPost = {
  $type: "fan.fics.work.chapter#bskyPost";
  postRef: ComAtprotoRepoStrongRef.Main;
};

export type LeafletDoc = {
  $type: "fan.fics.work.chapter#leafletDoc";
  docRef: ComAtprotoRepoStrongRef.Main;
};