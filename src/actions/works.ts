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
      const loggedInUser = context.locals.loggedInUser;

      // check against auth
      if (!loggedInUser) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You're not logged in!",
        });
      }

      // find the did of the logged in user
      const query = await db
        .select({ did: Users.userDid })
        .from(Users)
        .where(eq(Users.userDid, loggedInUser.did))
        .limit(1);

      if (query.length === 0) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "You can only add a work if you connected your PDS!",
        });
      }

      const user = query[0];
      // check nanoid for collision probability: https://zelark.github.io/nano-id-cc/
      const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const nanoid = customAlphabet(alphabet, 16);
      const slug = nanoid();
      
      const work = await db.insert(Works).values({
        slug,
        author: user.did,
        title: input.title,
        content: input.content,
        tags: input.tags,
      }).returning();

      // depending on whether someone toggled the privacy option, push this into firehouse
      // const agent = await

      return work;
    },
  }),
};