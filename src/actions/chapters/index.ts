import { z } from "astro:schema";
import addChapter from "./addChapter";
import updateChapter from "./updateChapter";
import deleteChapter from "./deleteChapter";

export const chapterSchema = z.object({
  uri: z.string().optional(), // this is in case someone wants to import a chapter
  title: z.string().optional(),
  notes: z.string().optional(),
  content: z.string().optional(),
});

export const chaptersActions = {
  addChapter,
  updateChapter,
  deleteChapter,
}