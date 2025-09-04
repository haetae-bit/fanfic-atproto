import { driver, worksTable } from "@/lib/db";
import { defineAction } from "astro:actions";
import { z } from "astro:content";

export const worksActions = {
  addWork: defineAction({
    accept: "form",
    input: z.object({
      author: z.union([z.string(), z.array(z.string())]),
      title: z.string(),
      content: z.string(),
    }),
    handler: async ({ author, title, content }) => {
      // check against auth


      // handle multiple authors
      const convertedAuthors = author.toString();

      const work = await driver.insert(worksTable).values({
        author: convertedAuthors,
        title,
        body: content
      }).returning();

      return work;
    },
  }),
};