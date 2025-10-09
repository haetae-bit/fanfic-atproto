import { defineAction } from "astro:actions";
import { chapterSchema } from ".";

export default defineAction({
  accept: "form",
  input: chapterSchema,
  handler: async ({ uri, title, content, notes }, context) => {
    
  }
});