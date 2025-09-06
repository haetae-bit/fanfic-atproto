import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:content";
import { db, eq, Users, Works } from "astro:db";
import { customAlphabet } from "nanoid";

const workSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(
    z.object({
      label: z.string(),
      uri: z.string(),
    })
  ),
});

export const worksActions = {
  addWork: defineAction({
    accept: "form",
    input: workSchema,
    handler: async (input, context) => {
      // check against auth
      if (!context.locals.loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      // const agent = await

      // find the id of the logged in user
      const userId = await db
        .select({ did: Users.userDid })
        .from(Users)
        .where(
          eq(Users.userDid, context.locals.loggedInUser.did)
        );
      
      // check nanoid for collision probability: https://zelark.github.io/nano-id-cc/
      const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const nanoid = customAlphabet(alphabet, 16);
      const slug = nanoid();
      
      const work = await db.insert(Works).values({
        slug,
        author: userId[0].did,
        title: input.title,
        content: input.content,
        tags: input.tags,
      }).returning();

      return work;
    },
  }),
};