import { z } from "astro:schema";
import addWork from "./addWork";
import updateWork from "./updateWork";
import deleteWork from "./deleteWork";

export const workSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tags: z.string(),
  publish: z.boolean(),
});

export const worksActions = {
  addWork,
  updateWork,
  deleteWork,
};